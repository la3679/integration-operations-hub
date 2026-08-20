using LegacyApi.Data;
using LegacyApi.Models;
using LegacyApi.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LegacyApi.Tests;

public sealed class EmployeeServiceTests
{
    [Fact]
    public async Task UpsertCreatesThenUpdatesTheSameEmployee()
    {
        var options = new DbContextOptionsBuilder<LegacyDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        await using var database = new LegacyDbContext(options);
        var service = new EmployeeService(database);

        var created = await service.UpsertAsync(
            new EmployeeUpsertRequest("e-900", "Riya", "Shah", "RIYA@EXAMPLE.COM", "Engineering", "ACTIVE"),
            CancellationToken.None);
        var updated = await service.UpsertAsync(
            new EmployeeUpsertRequest("E-900", "Riya", "Shah", "riya@example.com", "Platform", "ACTIVE"),
            CancellationToken.None);

        Assert.True(created.Created);
        Assert.False(updated.Created);
        Assert.Equal(created.Employee.Id, updated.Employee.Id);
        Assert.Equal("Platform", updated.Employee.Department);
        Assert.Equal(1, await database.Employees.CountAsync());
    }

    [Fact]
    public async Task SearchUsesCaseInsensitiveLinqFiltering()
    {
        var options = new DbContextOptionsBuilder<LegacyDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        await using var database = new LegacyDbContext(options);
        database.Employees.Add(new Employee
        {
            EmployeeNumber = "E-901",
            FirstName = "Avery",
            LastName = "Stone",
            Email = "avery@example.com",
            Department = "Operations",
            Status = "ACTIVE"
        });
        await database.SaveChangesAsync();

        var results = await new EmployeeService(database).SearchAsync("OPER", 10, CancellationToken.None);
        Assert.Single(results);
        Assert.Equal("E-901", results[0].EmployeeNumber);
    }
}
