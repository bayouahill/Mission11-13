import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './CartContext';
import BookList from './BookList';
import CartPage from './CartPage';
import AdminBooksPage from './AdminBooksPage';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/adminbooks" element={<AdminBooksPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
