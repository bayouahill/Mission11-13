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

    [HttpPost]
    public async Task<IActionResult> AddBook([FromBody] Book book)
    {
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBooks), new { id = book.BookID }, book);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBook(int id, [FromBody] Book book)
    {
        if (id != book.BookID)
            return BadRequest();

        _context.Entry(book).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null)
            return NotFound();

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
