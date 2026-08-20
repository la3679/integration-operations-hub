from .models import EmployeeRecord


DEPARTMENT_ALIASES = {
    "eng": "Engineering",
    "engineering": "Engineering",
    "ops": "Operations",
    "operations": "Operations",
    "hr": "Human Resources",
    "human resources": "Human Resources",
}


def normalize_record(record: EmployeeRecord) -> EmployeeRecord:
    department_key = " ".join(record.department.lower().split())
    normalized_department = DEPARTMENT_ALIASES.get(department_key, record.department.title())
    return record.model_copy(update={
        "employee_number": record.employee_number.upper(),
        "first_name": record.first_name.title(),
        "last_name": record.last_name.title(),
        "email": record.email.lower(),
        "department": normalized_department,
    })


def normalize_records(records: list[EmployeeRecord]) -> tuple[list[EmployeeRecord], list[str]]:
    normalized: list[EmployeeRecord] = []
    warnings: list[str] = []
    seen: set[str] = set()

    for record in records:
        candidate = normalize_record(record)
        if candidate.employee_number in seen:
            warnings.append(f"Duplicate employee number skipped: {candidate.employee_number}")
            continue
        seen.add(candidate.employee_number)
        normalized.append(candidate)

    return normalized, warnings

