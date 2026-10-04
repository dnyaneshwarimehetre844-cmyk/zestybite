import "../css/Delivery.css";
import { motion } from "framer-motion";

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

const FLOATERS = ["🍕", "🍔", "🍜", "🥗", "🍟", "🌮", "🍩", "🥤"];

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
        <div className="delivery-floaters" aria-hidden="true">
          {FLOATERS.map((emoji, i) => (
            <span
              key={i}
              style={{
                left: `${6 + i * 12}%`,
                animationDelay: `${i * 1.1}s`,
                animationDuration: `${9 + (i % 3) * 2}s`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <div className="delivery-hero-content">
          <motion.span
            className="delivery-hero-badge"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          >
            🛵 Fast & Reliable
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Delivery, Done Right
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            From your favorite restaurant to your doorstep — here's everything
            you need to know about how ZestyBite delivery works.
          </motion.p>
        </div>

        <svg
          className="delivery-route"
          viewBox="0 0 800 150"
          fill="none"
          aria-hidden="true"
        >
          <path
            id="routePath"
            d="M60 105 C 200 5, 330 165, 470 85 S 700 30, 740 95"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            className="route-flow"
            d="M60 105 C 200 5, 330 165, 470 85 S 700 30, 740 95"
            stroke="#fff"
            strokeWidth="4"
            strokeDasharray="2 12"
            strokeLinecap="round"
          />

          <circle cx="60" cy="105" r="26" fill="#fff" />
          <text
            x="60"
            y="105"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="26"
          >
            🍳
          </text>

          <circle
            className="route-pulse"
            cx="740"
            cy="95"
            r="26"
            fill="rgba(255,255,255,0.55)"
          />
          <circle
            className="route-pulse route-pulse-2"
            cx="740"
            cy="95"
            r="26"
            fill="rgba(255,255,255,0.55)"
          />
          <circle cx="740" cy="95" r="26" fill="#fff" />
          <text
            x="740"
            y="95"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="26"
          >
            🏠
          </text>

          <g>
            <animateMotion dur="5s" repeatCount="indefinite" calcMode="linear">
              <mpath href="#routePath" />
            </animateMotion>
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="34"
              transform="scale(-1,1)"
            >
              🛵
            </text>
          </g>
        </svg>
      </div>

      <section className="page-container delivery-container">
        <h2>How Delivery Works</h2>

        <div className="delivery-track" aria-hidden="true">
          <motion.div
            className="delivery-track-fill"
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 2.4, ease: "linear" }}
          />
        </div>

        <div className="delivery-steps">
          {DELIVERY_STEPS.map((step, idx) => (
            <motion.div
              className="delivery-step"
              key={step.title}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: idx * 0.6 }}
              whileHover={{ y: -8 }}
            >
              <motion.div
                className="delivery-step-icon"
                initial={{ rotate: -180, scale: 0 }}
                whileInView={{ rotate: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ type: "spring", delay: idx * 0.6 + 0.2 }}
              >
                <i className={`fa-solid ${step.icon}`}></i>
              </motion.div>
              <div className="delivery-step-number">{idx + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </motion.div>
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
