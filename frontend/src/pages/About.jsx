import { useEffect, useRef, useState } from "react";
import "../css/About.css";

function useReveal(once = true) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(node);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return [ref, visible];
}

function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  as: Tag = "div",
}) {
  const [ref, visible] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${variant} ${visible ? "reveal-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

function CountUp({ end, duration = 1400, decimals = 0, suffix = "" }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();

          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(end * eased);
            if (progress < 1) requestAnimationFrame(step);
            else setValue(end);
          };

          requestAnimationFrame(step);
          observer.unobserve(node);
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration]);

  const display =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

const WHY_US = [
  "Fast & Reliable Delivery — within 30 minutes.",
  "Top-Quality Ingredients — freshness and taste, always.",
  "Customer Satisfaction — rated 4.9/5 by happy customers.",
  "Affordable Pricing — great meals at great prices.",
];

const TEAM = [
  { name: "Pratik_Sadhu", role: "Founder & CEO", img: "pratik_sadhu.jpg" },
  { name: "Vikas_Khanna", role: "Head Chef", img: "Vikas_Khanna.jpg" },
  { name: "Sonia_Sodhi", role: "Operations Lead", img: "Sonia_sodhi.jpg" },
];

export default function About() {
  return (
    <>
      <div className="about-hero">
        <img
          src="/images/assets/banner_logo1.png"
          alt="ZestyBite kitchen"
          className="about-hero-img"
        />
        <div className="about-hero-gradient" />

        <div className="about-hero-overlay">
          <span className="about-hero-badge">
            🍔 Trusted by 50,000+ food lovers
          </span>
          <h1>
            Serving Happiness,{" "}
            <span className="about-hero-highlight">One Bite</span> at a Time
          </h1>
          <p>Good food, delivered fast, made with care.</p>

          <div className="about-hero-stats">
            <div className="about-stat-chip">
              <strong>4.9★</strong>
              <span>Average Rating</span>
            </div>
            <div className="about-stat-chip">
              <strong>30 min</strong>
              <span>Avg. Delivery</span>
            </div>
            <div className="about-stat-chip">
              <strong>1200+</strong>
              <span>Partner Restaurants</span>
            </div>
          </div>
        </div>

        <div className="about-hero-scroll" aria-hidden="true">
          <span></span>
        </div>
      </div>
      <section className="page-container">
        <Reveal variant="up">
          <h2>Who We Are</h2>
          <p>
            Welcome to ZestyBite! We are dedicated to delivering delicious meals
            straight to your doorstep. Our chefs use the freshest ingredients to
            ensure top-quality food for our customers.
          </p>
        </Reveal>

        <Reveal variant="up" delay={100}>
          <h2>Our Mission</h2>
          <p>
            Our mission is simple: bring restaurant-quality food to your home
            with convenience and speed. We partner with the best local
            restaurants and ensure every meal arrives hot and fresh.
          </p>
        </Reveal>

        <Reveal variant="up" delay={200}>
          <h2>Why Choose Us?</h2>
          <ul className="why-list">
            {WHY_US.map((line, idx) => (
              <Reveal
                as="li"
                variant="left"
                delay={idx * 100}
                key={line}
                className="why-item"
              >
                <span className="why-icon">✓</span>
                <span>{line}</span>
              </Reveal>
            ))}
          </ul>
        </Reveal>
      </section>

      <div className="about-rating-section">
        <Reveal as="h2" variant="up" className="rating-title">
          Trusted by Food Lovers
        </Reveal>
        <div className="rating-cards">
          <Reveal variant="zoom" className="rating-card">
            <h3>
              <CountUp end={4.9} decimals={1} />
            </h3>
            <div className="stars">
              <img src="/images/assets/rating_starts.png" alt="rating" />
            </div>
            <p>Average Rating</p>
          </Reveal>
          <Reveal variant="zoom" delay={100} className="rating-card">
            <h3>
              <CountUp end={50} suffix="K+" />
            </h3>
            <p>Happy Customers</p>
          </Reveal>
          <Reveal variant="zoom" delay={200} className="rating-card">
            <h3>
              <CountUp end={1200} suffix="+" />
            </h3>
            <p>Restaurant Partners</p>
          </Reveal>
          <Reveal variant="zoom" delay={300} className="rating-card">
            <h3>
              <CountUp end={99} suffix="%" />
            </h3>
            <p>On-Time Delivery</p>
          </Reveal>
        </div>
      </div>

      <section className="about-team">
        <Reveal as="h2" variant="up">
          Meet the Team
        </Reveal>
        <div className="team-grid">
          {TEAM.map((member, idx) => (
            <Reveal
              variant="zoom"
              delay={idx * 120}
              key={member.name}
              className="team-card"
            >
              <img src={`/images/assets/${member.img}`} alt={member.name} />
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="about-map">
        <Reveal as="h2" variant="up">
          Find Us Here
        </Reveal>
        <Reveal variant="up" delay={100} className="map-wrapper">
          <iframe
            title="ZestyBite Location"
            src="https://www.google.com/maps?q=Pune%2C%20Maharashtra%2C%20India&output=embed"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </Reveal>
      </section>

      <section className="about-cta">
        <Reveal as="h2" variant="up">
          Hungry already?
        </Reveal>
        <Reveal as="p" variant="up" delay={100}>
          Browse our menu and get your favorite meal delivered today.
        </Reveal>
        <Reveal variant="zoom" delay={200}>
          <a href="/#Explore-Menu" className="cta-btn">
            Order Now
          </a>
        </Reveal>
      </section>
    </>
  );
}
