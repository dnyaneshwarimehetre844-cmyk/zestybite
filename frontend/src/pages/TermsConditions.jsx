import "../css/TermsConditions.css";

const SECTIONS = [
  {
    id: "acceptance-of-terms",
    icon: "fa-file-signature",
    title: "Acceptance of Terms",
    body: (
      <p>
        By creating an account, browsing restaurants, or placing an order on
        ZestyBite, you agree to be bound by these Terms & Conditions and our
        Privacy Policy. If you do not agree with any part of these terms, please
        do not use our platform.
      </p>
    ),
  },
  {
    id: "eligibility",
    icon: "fa-id-card",
    title: "Eligibility",
    body: (
      <p>
        You must be at least 18 years old, or of legal contracting age in your
        jurisdiction, to create an account and place an order. By using
        ZestyBite, you confirm that all information you provide is accurate and
        that you have the legal capacity to enter into this agreement.
      </p>
    ),
  },
  {
    id: "account-responsibility",
    icon: "fa-user-lock",
    title: "Account Responsibility",
    body: (
      <>
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activity that occurs under your
          account. Notify us immediately if you suspect any unauthorized use.
        </p>
        <p>
          We reserve the right to suspend or terminate accounts that provide
          false information, violate these terms, or are used fraudulently.
        </p>
      </>
    ),
  },
  {
    id: "orders-and-payments",
    icon: "fa-cart-shopping",
    title: "Orders & Payments",
    body: (
      <>
        <ul>
          <li>
            All menu prices, taxes, and delivery fees are displayed at checkout
            before you confirm payment.
          </li>
          <li>
            Orders are placed directly with the restaurant partner; ZestyBite
            facilitates the transaction and delivery.
          </li>
          <li>
            Payments are processed securely through third-party payment
            gateways; we do not store your full card details.
          </li>
          <li>
            Order confirmation is subject to restaurant and rider availability,
            and may occasionally be declined or cancelled.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "cancellations-and-refunds",
    icon: "fa-rotate-left",
    title: "Cancellations & Refunds",
    body: (
      <p>
        Orders can typically be cancelled only before the restaurant begins
        preparation; once preparation starts, cancellation may not be possible.
        Refunds for incorrect, missing, or undelivered items are evaluated
        case-by-case and, where approved, credited to your original payment
        method or wallet within a reasonable timeframe.
      </p>
    ),
  },
  {
    id: "delivery-terms",
    icon: "fa-truck-fast",
    title: "Delivery Terms",
    body: (
      <p>
        Estimated delivery times are approximate and may vary due to weather,
        traffic, order volume, or restaurant delays. You are responsible for
        providing an accurate delivery address and being reasonably available to
        receive your order at the time of delivery.
      </p>
    ),
  },
  {
    id: "user-conduct",
    icon: "fa-hand",
    title: "User Conduct",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>
            Use the platform for any unlawful, fraudulent, or abusive purpose.
          </li>
          <li>
            Post false reviews, ratings, or misleading content about restaurants
            or delivery partners.
          </li>
          <li>
            Attempt to interfere with, hack, or disrupt the platform's security
            or functionality.
          </li>
          <li>
            Harass, threaten, or abuse restaurant staff or delivery partners.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "intellectual-property",
    icon: "fa-copyright",
    title: "Intellectual Property",
    body: (
      <p>
        All content on ZestyBite — including our logo, branding, app design,
        text, and graphics — is owned by or licensed to us and protected by
        applicable intellectual property laws. You may not copy, reproduce, or
        distribute any part of our platform without prior written consent.
      </p>
    ),
  },
  {
    id: "limitation-of-liability",
    icon: "fa-scale-balanced",
    title: "Limitation of Liability",
    body: (
      <p>
        ZestyBite acts as an intermediary between you, restaurant partners, and
        delivery partners. We are not liable for the quality, safety, or
        legality of food prepared by restaurant partners, nor for indirect or
        consequential damages arising from your use of the platform, to the
        fullest extent permitted by law.
      </p>
    ),
  },
  {
    id: "changes-to-terms",
    icon: "fa-file-pen",
    title: "Changes to These Terms",
    body: (
      <p>
        We may update these Terms & Conditions from time to time to reflect
        changes in our services or legal requirements. Continued use of
        ZestyBite after changes are posted constitutes your acceptance of the
        revised terms. We encourage you to review this page periodically.
      </p>
    ),
  },
  {
    id: "governing-law",
    icon: "fa-gavel",
    title: "Governing Law",
    body: (
      <p>
        These Terms & Conditions are governed by and construed in accordance
        with the laws of India, and any disputes arising from your use of
        ZestyBite will be subject to the exclusive jurisdiction of the courts in
        Pune, Maharashtra.
      </p>
    ),
  },
];

export default function TermsConditions() {
  return (
    <>
      <div className="terms-hero">
        <div className="terms-hero-content">
          <span className="terms-hero-badge">📜 Please Read Carefully</span>
          <h1>Terms & Conditions</h1>
          <p>Last updated: September 2026</p>
        </div>
      </div>

      <section className="page-container terms-container">
        <p className="terms-intro">
          These Terms & Conditions govern your use of the ZestyBite website and
          mobile app. By accessing or using our platform, you agree to these
          terms in full. Please read them carefully before placing an order.
        </p>

        <div className="terms-toc">
          <h3>On this page</h3>
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ul>
        </div>

        {SECTIONS.map((s) => (
          <div className="terms-section" id={s.id} key={s.id}>
            <div className="terms-section-heading">
              <div className="terms-section-icon">
                <i className={`fa-solid ${s.icon}`}></i>
              </div>
              <h2>{s.title}</h2>
            </div>
            {s.body}
          </div>
        ))}

        <div className="terms-contact-box">
          <h2>Have Questions About These Terms?</h2>
          <p>
            If anything here is unclear, our team is happy to walk you through
            it.
          </p>
          <a href="/contact" className="cta-btn">
            Contact Us
          </a>
        </div>
      </section>
    </>
  );
}
