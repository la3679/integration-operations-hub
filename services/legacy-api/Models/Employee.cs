using System.ComponentModel.DataAnnotations;

namespace LegacyApi.Models;

public sealed class Employee
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [MaxLength(20)]
    public required string EmployeeNumber { get; set; }

    [MaxLength(80)]
    public required string FirstName { get; set; }

    [MaxLength(80)]
    public required string LastName { get; set; }

    [MaxLength(160)]
    public required string Email { get; set; }

    [MaxLength(80)]
    public required string Department { get; set; }

    [MaxLength(20)]
    public required string Status { get; set; }

    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

