import "../css/Delivery.css";

const DELIVERY_STEPS = [
  {
    icon: "fa-utensils",
    title: "Place Your Order",
    text: "Browse the menu, pick your favorites and check out in a few taps.",
  },
  {
    icon: "fa-kitchen-set",
    title: "Restaurant Prepares It",
    text: "Your order is sent straight to the restaurant's kitchen for prep.",
  },
  {
    icon: "fa-motorcycle",
    title: "Rider Picks It Up",
    text: "A nearby delivery partner collects your order fresh and hot.",
  },
  {
    icon: "fa-box-open",
    title: "Delivered To You",
    text: "Track your rider live and get your food delivered to your door.",
  },
];

const AREAS = [
  "Pune City",
  "Hinjewadi",
  "Kothrud",
  "Baner",
  "Viman Nagar",
  "Kharadi",
  "Wakad",
  "Hadapsar",
  "Aundh",
  "Camp",
];

const FAQS = [
  {
    q: "How long does delivery usually take?",
    a: "Most orders arrive within 30–45 minutes, depending on your distance from the restaurant and local traffic conditions.",
  },
  {
    q: "Is there a minimum order value?",
    a: "Some restaurants set a minimum order value for delivery, which is shown on the restaurant's menu page before checkout.",
  },
  {
    q: "How much are delivery charges?",
    a: "Delivery charges vary by distance and demand and are always shown upfront on the checkout page before you pay.",
  },
  {
    q: "Can I track my order in real time?",
    a: "Yes. Once your order is confirmed, you can track your rider's live location from the Orders section of your account.",
  },
  {
    q: "What if my order arrives late or incorrect?",
    a: "Reach out through Contact Us or in-app support and our team will help with a refund, replacement, or credit as needed.",
  },
  {
    q: "Do you deliver late at night?",
    a: "Delivery hours depend on each restaurant's operating hours, shown on their menu page — many partners deliver past midnight.",
  },
];

export default function Delivery() {
  return (
    <>
      <div className="delivery-hero">
        <div className="delivery-hero-content">
          <span className="delivery-hero-badge">🛵 Fast & Reliable</span>
          <h1>Delivery, Done Right</h1>
          <p>
            From your favorite restaurant to your doorstep — here's everything
            you need to know about how ZestyBite delivery works.
          </p>
        </div>
      </div>

      <section className="page-container delivery-container">
        <h2>How Delivery Works</h2>
        <div className="delivery-steps">
          {DELIVERY_STEPS.map((step, idx) => (
            <div className="delivery-step" key={step.title}>
              <div className="delivery-step-icon">
                <i className={`fa-solid ${step.icon}`}></i>
              </div>
              <div className="delivery-step-number">{idx + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>

        <h2>Delivery Areas We Cover</h2>
        <p className="delivery-areas-intro">
          We're growing every week. Here are some of the areas our delivery
          partners currently serve:
        </p>
        <div className="delivery-areas">
          {AREAS.map((area) => (
            <span className="delivery-area-chip" key={area}>
              <i className="fa-solid fa-location-dot"></i> {area}
            </span>
          ))}
        </div>

        <h2>Delivery Charges & Timing</h2>
        <div className="delivery-info-grid">
          <div className="delivery-info-card">
            <i className="fa-solid fa-clock"></i>
            <h3>Avg. Delivery Time</h3>
            <p>30–45 minutes, depending on distance and order volume.</p>
          </div>
          <div className="delivery-info-card">
            <i className="fa-solid fa-indian-rupee-sign"></i>
            <h3>Delivery Fee</h3>
            <p>Calculated by distance and shown clearly before you pay.</p>
          </div>
          <div className="delivery-info-card">
            <i className="fa-solid fa-map-location-dot"></i>
            <h3>Live Tracking</h3>
            <p>Follow your rider in real time from order to doorstep.</p>
          </div>
          <div className="delivery-info-card">
            <i className="fa-solid fa-shield-heart"></i>
            <h3>Contactless Delivery</h3>
            <p>Choose to have your order left safely at your door.</p>
          </div>
        </div>

        <h2>Frequently Asked Questions</h2>
        <div className="delivery-faq">
          {FAQS.map((item) => (
            <details className="delivery-faq-item" key={item.q}>
              <summary>
                {item.q}
                <i className="fa-solid fa-chevron-down"></i>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>

        <div className="delivery-cta">
          <h2>Hungry? Let's get it delivered.</h2>
          <a href="/#Explore-Menu" className="cta-btn">
            Order Now
          </a>
        </div>
      </section>
    </>
  );
}
