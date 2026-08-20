import sys
import unittest
from pathlib import Path


SERVICE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVICE_ROOT))

from app.models import EmployeeRecord
from app.transform import normalize_records


class TransformTests(unittest.TestCase):
    def test_normalizes_names_email_department_and_number(self):
        record = EmployeeRecord(
            employeeNumber="e-2048",
            firstName="  riya ",
            lastName="SHAH",
            email="RIYA.SHAH@EXAMPLE.COM",
            department="eng",
            status="ACTIVE",
        )
        records, warnings = normalize_records([record])
        self.assertEqual(records[0].employee_number, "E-2048")
        self.assertEqual(records[0].first_name, "Riya")
        self.assertEqual(records[0].last_name, "Shah")
        self.assertEqual(records[0].email, "riya.shah@example.com")
        self.assertEqual(records[0].department, "Engineering")
        self.assertEqual(warnings, [])

    def test_skips_duplicate_employee_numbers_after_normalization(self):
        first = EmployeeRecord(employeeNumber="E-100", firstName="A", lastName="One", email="a@example.com", department="Ops", status="ACTIVE")
        duplicate = EmployeeRecord(employeeNumber="e-100", firstName="B", lastName="Two", email="b@example.com", department="Operations", status="ACTIVE")
        records, warnings = normalize_records([first, duplicate])
        self.assertEqual(len(records), 1)
        self.assertEqual(warnings, ["Duplicate employee number skipped: E-100"])

    def test_rejects_invalid_email(self):
        with self.assertRaises(ValueError):
            EmployeeRecord(employeeNumber="E-100", firstName="A", lastName="One", email="not-an-email", department="Ops", status="ACTIVE")


if __name__ == "__main__":
    unittest.main()

