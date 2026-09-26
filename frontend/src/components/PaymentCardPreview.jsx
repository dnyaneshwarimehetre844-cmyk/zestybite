function detectBrand(number) {
  const digits = number.replace(/\s/g, "");
  if (/^4/.test(digits)) return "VISA";
  if (/^5[1-5]/.test(digits)) return "MASTERCARD";
  if (/^3[47]/.test(digits)) return "AMEX";
  if (/^6(?:011|5)/.test(digits)) return "DISCOVER";
  return "CARD";
}

export default function PaymentCardPreview({ card, flipped }) {
  const number = card.number || "•••• •••• •••• ••••";
  const name = card.name ? card.name.toUpperCase() : "YOUR NAME";
  const expiry = card.expiry || "MM/YY";
  const cvv = card.cvv || "•••";
  const brand = detectBrand(card.number || "");

  return (
    <div className="payment-card-preview-wrap">
      <div className={`payment-card-preview ${flipped ? "is-flipped" : ""}`}>
        <div className="payment-card-face payment-card-front">
          <div className="payment-card-top">
            <div className="payment-card-chip" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className="payment-card-brand">{brand}</span>
          </div>

          <div className="payment-card-number">{number}</div>

          <div className="payment-card-bottom">
            <div>
              <span className="payment-card-label">Card Holder</span>
              <span className="payment-card-value">{name}</span>
            </div>
            <div>
              <span className="payment-card-label">Expires</span>
              <span className="payment-card-value">{expiry}</span>
            </div>
          </div>
        </div>

        <div className="payment-card-face payment-card-back">
          <div className="payment-card-stripe" />
          <div className="payment-card-signature">
            <span className="payment-card-signature-line">{name}</span>
            <span className="payment-card-cvv">{cvv}</span>
          </div>
          <span className="payment-card-brand payment-card-brand-back">
            {brand}
          </span>
        </div>
      </div>
    </div>
  );
}
