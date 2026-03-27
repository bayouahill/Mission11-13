import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import './CartPage.css';

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, lastBrowseState } =
    useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleContinueShopping = () => {
    const { pageNum, pageSize, category, sortOrder } = lastBrowseState;
    const params = new URLSearchParams({
      page: String(pageNum),
      size: String(pageSize),
      sortOrder,
      ...(category ? { category } : {}),
    });
    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="cart-wrapper">
      <div className="container py-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="cart-title">🛒 Your Cart</h1>
          <button
            className="btn btn-outline-primary"
            onClick={handleContinueShopping}
          >
            ← Continue Shopping
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted fs-5">Your cart is empty.</p>
            <button className="btn btn-primary mt-2" onClick={handleContinueShopping}>
              Browse Books
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive shadow-sm rounded">
              <table className="table align-middle mb-0 cart-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th className="text-center">Unit Price</th>
                    <th className="text-center">Quantity</th>
                    <th className="text-center">Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.bookID}>
                      <td className="fw-semibold">{item.title}</td>
                      <td className="text-center">${item.price.toFixed(2)}</td>
                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <button
                            className="btn btn-outline-secondary btn-sm qty-btn"
                            onClick={() =>
                              updateQuantity(item.bookID, item.quantity - 1)
                            }
                          >
                            −
                          </button>
                          <span className="qty-display">{item.quantity}</span>
                          <button
                            className="btn btn-outline-secondary btn-sm qty-btn"
                            onClick={() =>
                              updateQuantity(item.bookID, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="text-center text-success fw-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeFromCart(item.bookID)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Bootstrap table-group-divider — new Bootstrap 5.2+ feature */}
                <tfoot className="table-group-divider">
                  <tr>
                    <td colSpan={3} className="text-end fw-bold fs-5">
                      Total
                    </td>
                    <td className="text-center fw-bold fs-5 text-success">
                      ${total.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                className="btn btn-outline-danger"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <button className="btn btn-success px-4">
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartPage;
