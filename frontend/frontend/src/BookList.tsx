import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Toast as BsToast } from 'bootstrap';
import { useCart } from './CartContext';
import { fetchBooks, fetchCategories, type Book } from './api/booksApi';
import './BookList.css';

function BookList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, setLastBrowseState } = useCart();

  // Restore state from URL params (for "Continue Shopping")
  const [pageNum, setPageNum] = useState(Number(searchParams.get('page') ?? 1));
  const [pageSize, setPageSize] = useState(Number(searchParams.get('size') ?? 5));
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') ?? 'asc'
  );

  const [books, setBooks] = useState<Book[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastBook, setToastBook] = useState('');

  const toastRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(totalCount / pageSize);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch categories once on mount
  useEffect(() => {
    fetchCategories().then((data) => setCategories(data));
  }, []);

  // Fetch books whenever filters change
  useEffect(() => {
    setLoading(true);
    fetchBooks({ pageNum, pageSize, sortBy: 'title', sortOrder, category })
      .then((data) => {
        setBooks(data.books);
        setTotalCount(data.totalCount);
        setLoading(false);
      });
  }, [pageNum, pageSize, sortOrder, category]);

  // Keep URL in sync with state
  useEffect(() => {
    const p: Record<string, string> = {
      page: String(pageNum),
      size: String(pageSize),
      sortOrder,
    };
    if (category) p.category = category;
    setSearchParams(p, { replace: true });
  }, [pageNum, pageSize, sortOrder, category]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageNum(1);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPageNum(1);
  };

  const handleTitleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setPageNum(1);
  };

  const handleAddToCart = (book: Book) => {
    addToCart({ bookID: book.bookID, title: book.title, price: book.price });
    setToastBook(book.title);
    if (toastRef.current) {
      BsToast.getOrCreateInstance(toastRef.current).show();
    }
  };

  const handleGoToCart = () => {
    setLastBrowseState({ pageNum, pageSize, category, sortOrder });
    navigate('/cart');
  };

  return (
    <div className="bookstore-wrapper">
      {/* ── Bootstrap Toast (New Bootstrap feature #1) ── */}
      <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1100 }}>
        <div
          ref={toastRef}
          className="toast align-items-center text-bg-success border-0"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">
              🛒 <strong>{toastBook}</strong> added to cart!
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast"
              aria-label="Close"
            ></button>
          </div>
        </div>
      </div>

      <div className="container-fluid py-4 px-4">
        {/* ── Header ── */}
        <div className="row mb-4 align-items-center">
          <div className="col">
            <div className="bookstore-header">
              <h1 className="bookstore-title">📚 Bookstore</h1>
              <p className="bookstore-subtitle">Browse Prof. Hilton's favorite reads</p>
            </div>
          </div>
          <div className="col-auto">
            <button className="btn btn-primary position-relative" onClick={handleGoToCart}>
              🛒 Cart
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Bootstrap Grid: sidebar + main ── */}
        <div className="row g-4">

          {/* ── Sidebar ── */}
          <div className="col-lg-3">
            <div className="sticky-top" style={{ top: '1rem' }}>

              {/* Category Filter */}
              <div className="sidebar-card">
                <div className="sidebar-card-header">Filter by Category</div>
                <ul className="category-list">
                  <li>
                    <button
                      className={category === '' ? 'active' : ''}
                      onClick={() => handleCategoryChange('')}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button
                        className={category === cat ? 'active' : ''}
                        onClick={() => handleCategoryChange(cat)}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cart Summary */}
              <div className="sidebar-card">
                <div className="sidebar-card-header d-flex justify-content-between align-items-center">
                  <span>Cart Summary</span>
                  {cartCount > 0 && (
                    <span className="badge bg-primary rounded-pill">{cartCount}</span>
                  )}
                </div>
                <div className="p-3">
                  {cartItems.length === 0 ? (
                    <p className="text-muted small mb-0">No items yet.</p>
                  ) : (
                    <>
                      <ul className="list-unstyled mb-2 small">
                        {cartItems.map((item) => (
                          <li key={item.bookID} className="d-flex justify-content-between py-1">
                            <span className="text-truncate me-2" style={{ maxWidth: '160px' }}>
                              {item.title}
                            </span>
                            <span className="text-muted">×{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                      <hr className="my-2" />
                      <div className="d-flex justify-content-between fw-semibold small">
                        <span>Total</span>
                        <span style={{ color: 'var(--primary)' }}>
                          ${cartItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}
                        </span>
                      </div>
                      <button className="btn btn-primary btn-sm w-100 mt-3" onClick={handleGoToCart}>
                        View Cart
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="col-lg-9">
            <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
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
                {totalCount === 0
                  ? 'No books found'
                  : `Showing ${Math.min((pageNum - 1) * pageSize + 1, totalCount)}–${Math.min(pageNum * pageSize, totalCount)} of ${totalCount} books`}
              </span>
            </div>

            {/* Table or Spinner */}
            {loading ? (
              // Bootstrap spinner (New Bootstrap feature #1 - spinner-border)
              <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="content-card table-responsive">
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
                      <th></th>
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
                        <td>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleAddToCart(book)}
                          >
                            + Cart
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <nav>
                  <ul className="pagination">
                    <li className={`page-item ${pageNum === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPageNum(pageNum - 1)}>
                        &laquo; Prev
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
                        Next &raquo;
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookList;
