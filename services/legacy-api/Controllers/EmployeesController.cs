using LegacyApi.Models;
using LegacyApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace LegacyApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class EmployeesController(EmployeeService employees) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<EmployeeResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<EmployeeResponse>>> Search(
        [FromQuery] string? query,
        [FromQuery] int limit = 25,
        CancellationToken cancellationToken = default)
    {
        return Ok(await employees.SearchAsync(query, limit, cancellationToken));
    }

    [HttpPut]
    [ProducesResponseType<EmployeeResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<EmployeeResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<EmployeeResponse>> Upsert(
        [FromBody] EmployeeUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var result = await employees.UpsertAsync(request, cancellationToken);
        if (result.Created)
        {
            return Created($"/api/employees?query={Uri.EscapeDataString(result.Employee.EmployeeNumber)}", result.Employee);
        }
        return Ok(result.Employee);
    }
}

