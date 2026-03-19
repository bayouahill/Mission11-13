import { useEffect, useState } from 'react';

interface Book {
  bookID: number;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  classification: string;
  category: string;
  pageCount: number;
  price: number;
}

function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('title');

  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    fetch(
      `http://localhost:5200/books?pageNum=${pageNum}&pageSize=${pageSize}&sortBy=${sortBy}`
    )
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.books);
        setTotalCount(data.totalCount);
      });
  }, [pageNum, pageSize, sortBy]);

  // Reset to page 1 when pageSize changes
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageNum(1);
  };

  const handleSortChange = () => {
    setSortBy('title');
    setPageNum(1);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Bookstore</h1>

      <div className="d-flex align-items-center gap-3 mb-3">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="pageSize" className="form-label mb-0">
            Results per page:
          </label>
          <select
            id="pageSize"
            className="form-select form-select-sm w-auto"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={handleSortChange}
        >
          Sort by Title
        </button>
      </div>

      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Publisher</th>
            <th>ISBN</th>
            <th>Classification</th>
            <th>Category</th>
            <th>Pages</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.bookID}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.publisher}</td>
              <td>{book.isbn}</td>
              <td>{book.classification}</td>
              <td>{book.category}</td>
              <td>{book.pageCount}</td>
              <td>${book.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex align-items-center justify-content-between">
        <span className="text-muted">
          Showing {(pageNum - 1) * pageSize + 1}–
          {Math.min(pageNum * pageSize, totalCount)} of {totalCount} books
        </span>

        <nav>
          <ul className="pagination mb-0">
            <li className={`page-item ${pageNum === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPageNum(pageNum - 1)}>
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li
                key={page}
                className={`page-item ${page === pageNum ? 'active' : ''}`}
              >
                <button className="page-link" onClick={() => setPageNum(page)}>
                  {page}
                </button>
              </li>
            ))}
            <li className={`page-item ${pageNum === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPageNum(pageNum + 1)}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default BookList;
