const API_BASE =
  'https://mission13-hill-backend-akapg6dugxdsgte7.centralus-01.azurewebsites.net';

export interface Book {
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

export interface BooksResponse {
  books: Book[];
  totalCount: number;
  pageNum: number;
  pageSize: number;
}

export interface GetBooksParams {
  pageNum: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  category?: string;
}

export async function fetchBooks(params: GetBooksParams): Promise<BooksResponse> {
  const query = new URLSearchParams({
    pageNum: String(params.pageNum),
    pageSize: String(params.pageSize),
    sortBy: params.sortBy ?? 'title',
    sortOrder: params.sortOrder ?? 'asc',
    ...(params.category ? { category: params.category } : {}),
  });
  const res = await fetch(`${API_BASE}/books?${query}`);
  return res.json();
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/categories`);
  return res.json();
}

export async function addBook(book: Omit<Book, 'bookID'>): Promise<void> {
  await fetch(`${API_BASE}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...book, bookID: 0 }),
  });
}

export async function updateBook(book: Book): Promise<void> {
  await fetch(`${API_BASE}/books/${book.bookID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  });
}

export async function deleteBook(id: number): Promise<void> {
  await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' });
}
