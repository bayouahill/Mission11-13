using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1.Controllers;

[ApiController]
[Route("[controller]")]
public class BooksController : ControllerBase
{
    private readonly BookstoreContext _context;

    public BooksController(BookstoreContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBooks(
        [FromQuery] int pageNum = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] string sortBy = "title",
        [FromQuery] string sortOrder = "asc",
        [FromQuery] string? category = null)
    {
        var query = _context.Books.AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(b => b.Category == category);

        if (sortBy.ToLower() == "title")
            query = sortOrder.ToLower() == "desc"
                ? query.OrderByDescending(b => b.Title)
                : query.OrderBy(b => b.Title);

        var totalCount = await query.CountAsync();

        var books = await query
            .Skip((pageNum - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new
        {
            books,
            totalCount,
            pageNum,
            pageSize
        });
    }
}
