import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import PaymentCardPreview from "../components/PaymentCardPreview";
import api from "../api/axios";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  phone: "",
};

const initialCard = {
  number: "",
  name: "",
  expiry: "",
  cvv: "",
};

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isExpiryValid(expiry) {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return false;
  const month = Number(match[1]);
  const year = Number(match[2]) + 2000;
  if (month < 1 || month > 12) return false;
  const expiryDate = new Date(year, month, 1); 
  return expiryDate > new Date();
}

export default function Checkout({ onRequireAuth }) {
  const { cart, subtotal, deliveryFee, discount, total, coupon, clearCart } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("delivery"); 
  const [form, setForm] = useState(initialForm);
  const [card, setCard] = useState(initialCard);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [cvvFocused, setCvvFocused] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    if (name === "number") {
      setCard({ ...card, number: formatCardNumber(value) });
    } else if (name === "expiry") {
      setCard({ ...card, expiry: formatExpiry(value) });
    } else if (name === "cvv") {
      setCard({ ...card, cvv: value.replace(/\D/g, "").slice(0, 4) });
    } else {
      setCard({ ...card, [name]: value });
    }
  };

  const goToPayment = (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      onRequireAuth?.();
      return;
    }
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setStep("payment");
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");

    const digitsOnly = card.number.replace(/\s/g, "");
    if (digitsOnly.length !== 16) {
      setError("Enter a 16-digit card number.");
      return;
    }
    if (!card.name.trim()) {
      setError("Enter the name on the card.");
      return;
    }
    if (!isExpiryValid(card.expiry)) {
      setError("Enter a valid, non-expired expiry date (MM/YY).");
      return;
    }
    if (card.cvv.length < 3) {
      setError("Enter a valid CVV.");
      return;
    }

    setPlacing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      await api.post("/orders", {
        items: cart.map((c) => ({
          food: c.id || c._id,
          name: c.name,
          price: c.price,
          image: c.image,
          qty: c.qty,
        })),
        deliveryInfo: form,
        subtotal,
        deliveryFee,
        couponCode: coupon?.code || undefined,
        total,
      });

      clearCart();
      navigate("/account");
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <section className="checkout-page">
      <div className="checkout-container">
        {step === "delivery" ? (
          <div className="delivery-info">
            <h2>Delivery Information</h2>

            <form id="checkoutForm" onSubmit={goToPayment}>
              <div className="row">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  required
                  value={form.firstName}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  required
                  value={form.lastName}
                  onChange={handleChange}
                />
              </div>
              <div className="row">
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="street"
                  placeholder="Street"
                  required
                  value={form.street}
                  onChange={handleChange}
                />
              </div>
              <div className="row">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  required
                  value={form.city}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  required
                  value={form.state}
                  onChange={handleChange}
                />
              </div>

              <div className="row">
                <input
                  type="text"
                  name="zipCode"
                  placeholder="Zip code"
                  required
                  value={form.zipCode}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  required
                  value={form.country}
                  onChange={handleChange}
                />
              </div>

              <input
                type="text"
                name="phone"
                placeholder="Phone"
                required
                value={form.phone}
                onChange={handleChange}
              />
            </form>
            {error && <p className="admin-error">{error}</p>}
          </div>
        ) : (
          <div className="delivery-info payment-card-step">
            <h2>Payment</h2>
            <PaymentCardPreview card={card} flipped={cvvFocused} />

            <form id="paymentForm" onSubmit={handlePay}>
              <input
                type="text"
                name="number"
                placeholder="Card Number (e.g. 4242 4242 4242 4242)"
                required
                value={card.number}
                onChange={handleCardChange}
                inputMode="numeric"
              />
              <input
                type="text"
                name="name"
                placeholder="Name on Card"
                required
                value={card.name}
                onChange={handleCardChange}
              />
              <div className="row">
                <input
                  type="text"
                  name="expiry"
                  placeholder="MM/YY"
                  required
                  value={card.expiry}
                  onChange={handleCardChange}
                  inputMode="numeric"
                />
                <input
                  type="text"
                  name="cvv"
                  placeholder="CVV"
                  required
                  value={card.cvv}
                  onChange={handleCardChange}
                  onFocus={() => setCvvFocused(true)}
                  onBlur={() => setCvvFocused(false)}
                  inputMode="numeric"
                />
              </div>
            </form>
            {error && <p className="admin-error">{error}</p>}

            <button
              type="button"
              className="payment-back-btn"
              onClick={() => {
                setError("");
                setStep("delivery");
              }}
            >
              ← Back to delivery info
            </button>
          </div>
        )}

        <div className="checkout-summary">
          <h2>Cart Totals</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>Rs {subtotal}</span>
          </div>

          {coupon && (
            <div className="summary-row discount-row">
              <span>Discount ({coupon.code})</span>
              <span>-Rs {discount}</span>
            </div>
          )}

          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>Rs {deliveryFee}</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>Rs {total}</span>
          </div>

          {step === "delivery" ? (
            <button type="submit" form="checkoutForm" className="payment-btn">
              Continue to Payment
            </button>
          ) : (
            <button
              type="submit"
              form="paymentForm"
              className="payment-btn"
              disabled={placing}
            >
              {placing ? "Processing payment..." : `Pay Rs ${total}`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
