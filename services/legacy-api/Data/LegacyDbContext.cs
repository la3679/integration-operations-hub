using LegacyApi.Models;
using Microsoft.EntityFrameworkCore;

namespace LegacyApi.Data;

public sealed class LegacyDbContext(DbContextOptions<LegacyDbContext> options) : DbContext(options)
{
    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var employee = modelBuilder.Entity<Employee>();
        employee.ToTable("employees");
        employee.HasKey(value => value.Id);
        employee.HasIndex(value => value.EmployeeNumber).IsUnique();
        employee.HasIndex(value => value.Email).IsUnique();
        employee.Property(value => value.Status).HasDefaultValue("ACTIVE");
    }
}

