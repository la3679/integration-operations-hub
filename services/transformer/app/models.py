from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


def to_camel(value: str) -> str:
    parts = value.split("_")
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


class ApiModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, str_strip_whitespace=True)


class EmployeeRecord(ApiModel):
    employee_number: str = Field(min_length=2, max_length=20, pattern=r"^[A-Za-z0-9-]+$")
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    email: str = Field(min_length=5, max_length=160, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    department: str = Field(min_length=1, max_length=80)
    status: Literal["ACTIVE", "INACTIVE"]


class TransformRequest(ApiModel):
    records: list[EmployeeRecord] = Field(min_length=1, max_length=100)


class TransformResponse(ApiModel):
    records: list[EmployeeRecord]
    accepted: int
    warnings: list[str]


class ErrorEnvelope(ApiModel):
    code: str
    message: str
    correlation_id: str
    details: object | None = None

