import { useEffect, useState } from 'react';
import './BookList.css';

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
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    fetch(
      `http://localhost:5200/books?pageNum=${pageNum}&pageSize=${pageSize}&sortBy=title&sortOrder=${sortOrder}`
    )
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.books);
        setTotalCount(data.totalCount);
      });
  }, [pageNum, pageSize, sortOrder]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageNum(1);
  };

  const handleTitleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setPageNum(1);
  };

  return (
    <div className="bookstore-wrapper">
      <div className="container py-5">
        <div className="bookstore-header mb-4">
          <h1 className="bookstore-title">📚 Bookstore</h1>
          <p className="bookstore-subtitle">Browse Prof. Hilton's favorite reads</p>
        </div>

        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="pageSize" className="form-label mb-0 fw-semibold">
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
          <span className="text-muted small">
            Showing {Math.min((pageNum - 1) * pageSize + 1, totalCount)}–
            {Math.min(pageNum * pageSize, totalCount)} of {totalCount} books
          </span>
        </div>

        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle mb-0 bookstore-table">
            <thead>
              <tr>
                <th
                  className="sortable-col"
                  onClick={handleTitleSort}
                  title="Click to sort by title"
                >
                  Title{' '}
                  <span className="sort-icon">
                    {sortOrder === 'asc' ? '▲' : '▼'}
                  </span>
                </th>
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
                  <td className="fw-semibold">{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.publisher}</td>
                  <td className="text-muted small">{book.isbn}</td>
                  <td>
                    <span className="badge bg-secondary">{book.classification}</span>
                  </td>
                  <td>
                    <span className="badge bg-info text-dark">{book.category}</span>
                  </td>
                  <td>{book.pageCount}</td>
                  <td className="text-success fw-semibold">
                    ${book.price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${pageNum === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setPageNum(pageNum - 1)}
                >
                  &laquo; Prev
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <li
                  key={page}
                  className={`page-item ${page === pageNum ? 'active' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPageNum(page)}
                  >
                    {page}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${pageNum === totalPages ? 'disabled' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => setPageNum(pageNum + 1)}
                >
                  Next &raquo;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default BookList;
