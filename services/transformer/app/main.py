from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .models import ErrorEnvelope, TransformRequest, TransformResponse
from .transform import normalize_records


app = FastAPI(
    title="Integration Transformation Service",
    version="1.0.0",
    description="Validates and normalizes enterprise employee payloads.",
)


@app.middleware("http")
async def correlation_middleware(request: Request, call_next):
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid4()))
    request.state.correlation_id = correlation_id
    response = await call_next(request)
    response.headers["X-Correlation-ID"] = correlation_id
    return response


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, error: RequestValidationError):
    envelope = ErrorEnvelope(
        code="VALIDATION_ERROR",
        message="One or more employee records are invalid.",
        correlation_id=request.state.correlation_id,
        details=error.errors(),
    )
    return JSONResponse(status_code=422, content=envelope.model_dump(by_alias=True))


@app.get("/health")
def health() -> dict[str, str]:
    return {"service": "transformer", "status": "healthy"}


@app.post("/transform", response_model=TransformResponse)
def transform(request: TransformRequest) -> TransformResponse:
    records, warnings = normalize_records(request.records)
    return TransformResponse(records=records, accepted=len(records), warnings=warnings)

