using LegacyApi.Data;
using LegacyApi.Models;
using Microsoft.EntityFrameworkCore;

namespace LegacyApi.Services;

public sealed class EmployeeService(LegacyDbContext database)
{
    public async Task<IReadOnlyList<EmployeeResponse>> SearchAsync(string? query, int limit, CancellationToken cancellationToken)
    {
        var employees = database.Employees.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(query))
        {
            var term = query.Trim().ToLower();
            employees = employees.Where(employee =>
                employee.EmployeeNumber.ToLower().Contains(term) ||
                employee.FirstName.ToLower().Contains(term) ||
                employee.LastName.ToLower().Contains(term) ||
                employee.Department.ToLower().Contains(term));
        }

        return await employees
            .OrderBy(employee => employee.LastName)
            .ThenBy(employee => employee.FirstName)
            .Take(Math.Clamp(limit, 1, 100))
            .Select(employee => ToResponse(employee))
            .ToListAsync(cancellationToken);
    }

    public async Task<(EmployeeResponse Employee, bool Created)> UpsertAsync(EmployeeUpsertRequest request, CancellationToken cancellationToken)
    {
        var employeeNumber = request.EmployeeNumber.Trim().ToUpperInvariant();
        var employee = await database.Employees.SingleOrDefaultAsync(
            value => value.EmployeeNumber == employeeNumber,
            cancellationToken);
        var created = employee is null;

        if (employee is null)
        {
            employee = new Employee
            {
                EmployeeNumber = employeeNumber,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = request.Email.Trim().ToLowerInvariant(),
                Department = request.Department.Trim(),
                Status = request.Status
            };
            database.Employees.Add(employee);
        }
        else
        {
            employee.FirstName = request.FirstName.Trim();
            employee.LastName = request.LastName.Trim();
            employee.Email = request.Email.Trim().ToLowerInvariant();
            employee.Department = request.Department.Trim();
            employee.Status = request.Status;
            employee.UpdatedAt = DateTimeOffset.UtcNow;
        }

        await database.SaveChangesAsync(cancellationToken);
        return (ToResponse(employee), created);
    }

    private static EmployeeResponse ToResponse(Employee employee) => new(
        employee.Id,
        employee.EmployeeNumber,
        employee.FirstName,
        employee.LastName,
        employee.Email,
        employee.Department,
        employee.Status,
        employee.UpdatedAt);
}

