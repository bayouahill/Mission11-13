import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchBooks,
  addBook,
  updateBook,
  deleteBook,
  type Book,
} from './api/booksApi';

const emptyBook: Omit<Book, 'bookID'> = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
};

export default function AdminBooksPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 10;

  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState(emptyBook);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await fetchBooks({ pageNum, pageSize, sortBy: 'title', sortOrder: 'asc' });
      setBooks(data.books);
      setTotalCount(data.totalCount);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [pageNum]);

  const openAdd = () => {
    setEditingBook(null);
    setFormData(emptyBook);
    setShowForm(true);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      isbn: book.isbn,
      classification: book.classification,
      category: book.category,
      pageCount: book.pageCount,
      price: book.price,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this book?')) return;
    await deleteBook(id);
    loadBooks();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBook) {
        await updateBook({ ...formData, bookID: editingBook.bookID });
      } else {
        await addBook(formData);
      }
      setShowForm(false);
      loadBooks();
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Admin — Manage Books</h1>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={openAdd}>
            + Add Book
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/')}
          >
            Back to Store
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header">
            <strong>{editingBook ? 'Edit Book' : 'Add New Book'}</strong>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {(
                  [
                    ['title', 'Title', 'text'],
                    ['author', 'Author', 'text'],
                    ['publisher', 'Publisher', 'text'],
                    ['isbn', 'ISBN', 'text'],
                    ['classification', 'Classification', 'text'],
                    ['category', 'Category', 'text'],
                    ['pageCount', 'Page Count', 'number'],
                    ['price', 'Price', 'number'],
                  ] as [keyof typeof formData, string, string][]
                ).map(([field, label, type]) => (
                  <div className="col-md-3" key={field}>
                    <label className="form-label">{label}</label>
                    <input
                      className="form-control"
                      type={type}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      step={field === 'price' ? '0.01' : undefined}
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={saving}
                >
                  {saving ? 'Saving…' : editingBook ? 'Update Book' : 'Add Book'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" />
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Publisher</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Pages</th>
                  <th>Price</th>
                  <th style={{ width: '130px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.bookID}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.publisher}</td>
                    <td>{book.isbn}</td>
                    <td>{book.category}</td>
                    <td>{book.pageCount}</td>
                    <td>${book.price.toFixed(2)}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openEdit(book)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(book.bookID)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Showing {(pageNum - 1) * pageSize + 1}–
              {Math.min(pageNum * pageSize, totalCount)} of {totalCount} books
            </small>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${pageNum === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPageNum((p) => p - 1)}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <li
                      key={p}
                      className={`page-item ${p === pageNum ? 'active' : ''}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setPageNum(p)}
                      >
                        {p}
                      </button>
                    </li>
                  )
                )}
                <li
                  className={`page-item ${pageNum === totalPages ? 'disabled' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPageNum((p) => p + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
