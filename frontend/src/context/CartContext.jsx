import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import api from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

function readCart() {
  try {
    const raw = JSON.parse(localStorage.getItem("cart")) || [];

    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .filter((item) => item && item.name)
      .map((item) => ({
        ...item,
        price: Number(item.price) || 0,
        qty: Number(item.qty) > 0 ? Number(item.qty) : 1,
      }));
  } catch {
    return [];
  }
}

function readCoupon() {
  try {
    return JSON.parse(localStorage.getItem("coupon")) || null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }) {
  const { isLoggedIn, openAuthModal } = useAuth();

  const [cart, setCart] = useState(readCart);

  const [coupon, setCoupon] = useState(readCoupon);

  const [couponError, setCouponError] = useState("");

  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem("coupon", JSON.stringify(coupon));
    } else {
      localStorage.removeItem("coupon");
    }
  }, [coupon]);

  const addToCart = useCallback(
    (item) => {
      if (!isLoggedIn) {
        openAuthModal();
        return;
      }

      setCart((prev) => {
        const found = prev.find((c) => c.id === (item._id || item.id));

        if (found) {
          return prev.map((c) =>
            c.id === (item._id || item.id)
              ? {
                  ...c,
                  qty: c.qty + 1,
                }
              : c,
          );
        }

        return [
          ...prev,
          {
            id: item._id || item.id,

            name: item.name,

            price: item.price,

            image: item.image,

            qty: 1,
          },
        ];
      });
    },
    [isLoggedIn, openAuthModal],
  );

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    setCart((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              qty: Math.max(1, qty),
            }
          : c,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCoupon(null);
    setCouponError("");
  }, []);

  const cartCount = cart.reduce(
    (sum, item) => sum + (Number(item.qty) || 0),
    0,
  );

  const subtotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0),
    0,
  );

  const deliveryFee = cart.length > 0 ? 50 : 0;

  const discount = Number(coupon?.discount) || 0;

  const total = Math.max(0, subtotal + deliveryFee - discount);

  const applyCoupon = useCallback(
    async (code) => {
      if (!code) {
        return false;
      }

      setApplyingCoupon(true);

      setCouponError("");

      try {
        const res = await api.post("/coupons/apply", {
          code,
          orderValue: subtotal,
        });

        setCoupon({
          code: res.data.code,
          discount: res.data.discount,
        });

        return true;
      } catch (err) {
        setCoupon(null);

        setCouponError(err.response?.data?.message || "Could not apply coupon");

        return false;
      } finally {
        setApplyingCoupon(false);
      }
    },
    [subtotal],
  );

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setCouponError("");
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,

        cartCount,
        subtotal,
        deliveryFee,
        discount,
        total,

        coupon,
        couponError,
        applyingCoupon,

        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return ctx;
}
