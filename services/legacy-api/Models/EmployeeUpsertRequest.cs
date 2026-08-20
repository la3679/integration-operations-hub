using System.ComponentModel.DataAnnotations;

namespace LegacyApi.Models;

public sealed record EmployeeUpsertRequest(
    [property: Required, StringLength(20, MinimumLength = 2)] string EmployeeNumber,
    [property: Required, StringLength(80)] string FirstName,
    [property: Required, StringLength(80)] string LastName,
    [property: Required, EmailAddress, StringLength(160)] string Email,
    [property: Required, StringLength(80)] string Department,
    [property: Required, RegularExpression("ACTIVE|INACTIVE")] string Status
);

public sealed record EmployeeResponse(
    Guid Id,
    string EmployeeNumber,
    string FirstName,
    string LastName,
    string Email,
    string Department,
    string Status,
    DateTimeOffset UpdatedAt
);

