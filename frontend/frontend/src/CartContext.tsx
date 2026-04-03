import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
  bookID: number;
  title: string;
  price: number;
  quantity: number;
}

export interface BrowseState {
  pageNum: number;
  pageSize: number;
  category: string;
  sortOrder: 'asc' | 'desc';
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (book: { bookID: number; title: string; price: number }) => void;
  removeFromCart: (bookID: number) => void;
  updateQuantity: (bookID: number, quantity: number) => void;
  clearCart: () => void;
  lastBrowseState: BrowseState;
  setLastBrowseState: (state: BrowseState) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastBrowseState, setLastBrowseState] = useState<BrowseState>({
    pageNum: 1,
    pageSize: 5,
    category: '',
    sortOrder: 'asc',
  });

  const addToCart = (book: { bookID: number; title: string; price: number }) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.bookID === book.bookID);
      if (existing) {
        return prev.map((item) =>
          item.bookID === book.bookID
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...book, quantity: 1 }];
    });
  };

  const removeFromCart = (bookID: number) => {
    setCartItems((prev) => prev.filter((item) => item.bookID !== bookID));
  };

  const updateQuantity = (bookID: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookID);
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.bookID === bookID ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        lastBrowseState,
        setLastBrowseState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
