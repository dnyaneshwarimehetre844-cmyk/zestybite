import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../api/helpers";

export default function Cart() {
  const {
    cart,
    removeFromCart,
    subtotal,
    deliveryFee,
    discount,
    total,
    coupon,
    couponError,
    applyingCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const ok = await applyCoupon(couponInput.trim());
    if (ok) setCouponInput("");
  };

  return (
    <section className="cart-page">
      <h2>Your Cart</h2>

      <section className="cart-container">
        <div className="cart-table">
          <div className="cart-header">
            <span>Item</span>
            <span>Title</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span>Remove</span>
          </div>

          <div>
            {cart.length === 0 ? (
              <p className="empty-text">No food items added yet.</p>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item.name}>
                  <img src={getImageUrl(item.image)} alt={item.name} />
                  <span data-label="Title">{item.name}</span>
                  <span data-label="Price">₹{item.price}</span>
                  <span data-label="Qty">{item.qty}</span>
                  <span data-label="Total">₹{item.price * item.qty}</span>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="cart-summary">
          <h3>Cart Totals</h3>

          <div className="coupon-box">
            {coupon ? (
              <div className="coupon-applied">
                <span>
                  Coupon <strong>{coupon.code}</strong> applied
                </span>
                <button
                  type="button"
                  className="coupon-remove-btn"
                  onClick={removeCoupon}
                >
                  Remove
                </button>
              </div>
            ) : (
              <form className="coupon-form" onSubmit={handleApplyCoupon}>
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  disabled={cart.length === 0 || applyingCoupon}
                />
                <button
                  type="submit"
                  className="coupon-apply-btn"
                  disabled={
                    cart.length === 0 || applyingCoupon || !couponInput.trim()
                  }
                >
                  {applyingCoupon ? "Checking..." : "Apply"}
                </button>
              </form>
            )}
            {couponError && <p className="coupon-error">{couponError}</p>}
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          {coupon && (
            <div className="summary-row discount-row">
              <span>Discount ({coupon.code})</span>
              <span>-₹{discount}</span>
            </div>
          )}

          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>₹ {deliveryFee}</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>₹ {total}</span>
          </div>

          <button
            className="checkout-btn"
            disabled={cart.length === 0}
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>
        </div>
      </section>
    </section>
  );
}
