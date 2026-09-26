import "../css/PrivacyPolicy.css";

const SECTIONS = [
  {
    id: "information-we-collect",
    icon: "fa-database",
    title: "Information We Collect",
    body: (
      <>
        <p>
          When you use ZestyBite, we collect information you give us directly —
          such as your name, phone number, email address, delivery address and
          payment details — along with information generated as you use the app,
          like your order history, saved addresses and app preferences.
        </p>
        <p>
          We also automatically collect certain technical information, including
          device type, IP address, browser type, and approximate location, to
          help us deliver your orders accurately and keep the platform secure.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    icon: "fa-gears",
    title: "How We Use Your Information",
    body: (
      <>
        <ul>
          <li>To process and deliver your orders accurately and on time.</li>
          <li>
            To personalize your experience, such as showing nearby restaurants
            and relevant offers.
          </li>
          <li>
            To communicate order updates, promotions and important account
            notices.
          </li>
          <li>
            To improve our platform, troubleshoot issues, and detect fraud.
          </li>
          <li>
            To comply with legal obligations and enforce our Terms of Service.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "sharing-of-information",
    icon: "fa-share-nodes",
    title: "Sharing of Information",
    body: (
      <>
        <p>
          We share your information only where necessary to provide our service:
          with restaurant partners to prepare your order, with delivery partners
          to complete delivery, and with payment processors to complete
          transactions securely.
        </p>
        <p>
          We do not sell your personal information to third parties. We may
          share limited data with analytics and marketing service providers,
          strictly to improve our platform and communications, and only under
          confidentiality obligations.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    icon: "fa-cookie-bite",
    title: "Cookies & Tracking",
    body: (
      <p>
        We use cookies and similar technologies to keep you logged in, remember
        your preferences, and understand how the app and website are used so we
        can improve them. You can control cookies through your browser settings,
        though some features may not work correctly if cookies are disabled.
      </p>
    ),
  },
  {
    id: "data-security",
    icon: "fa-lock",
    title: "Data Security",
    body: (
      <p>
        We use industry-standard safeguards — including encryption during
        transmission and restricted access to personal data — to protect your
        information from unauthorized access, alteration, or disclosure.
        However, no method of transmission over the internet is 100% secure, and
        we encourage you to also protect your account credentials.
      </p>
    ),
  },
  {
    id: "your-rights",
    icon: "fa-user-shield",
    title: "Your Rights & Choices",
    body: (
      <>
        <ul>
          <li>
            Access, update or correct your personal information from your
            Account settings.
          </li>
          <li>
            Request deletion of your account and associated data, subject to
            legal record-keeping requirements.
          </li>
          <li>Opt out of promotional emails and notifications at any time.</li>
          <li>
            Manage location and notification permissions through your device
            settings.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "childrens-privacy",
    icon: "fa-child-reaching",
    title: "Children's Privacy",
    body: (
      <p>
        ZestyBite is not intended for use by individuals under the age of 18. We
        do not knowingly collect personal information from children. If we
        become aware that we have inadvertently collected such information, we
        will take steps to delete it promptly.
      </p>
    ),
  },
  {
    id: "policy-changes",
    icon: "fa-file-pen",
    title: "Changes to This Policy",
    body: (
      <p>
        We may update this Privacy Policy from time to time to reflect changes
        in our practices or for legal, operational, or regulatory reasons. We
        will notify you of significant changes through the app or by email, and
        the "last updated" date below will always reflect the latest version.
      </p>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <div className="privacy-hero">
        <div className="privacy-hero-content">
          <span className="privacy-hero-badge">🔒 Your Trust Matters</span>
          <h1>Privacy Policy</h1>
          <p>Last updated: September 2026</p>
        </div>
      </div>

      <section className="page-container privacy-container">
        <p className="privacy-intro">
          At ZestyBite, we're committed to protecting your privacy and being
          transparent about how we collect, use, and safeguard your information.
          This policy explains what data we collect, why we collect it, and the
          choices you have.
        </p>

        <div className="privacy-toc">
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
          <div className="privacy-section" id={s.id} key={s.id}>
            <div className="privacy-section-heading">
              <div className="privacy-section-icon">
                <i className={`fa-solid ${s.icon}`}></i>
              </div>
              <h2>{s.title}</h2>
            </div>
            {s.body}
          </div>
        ))}

        <div className="privacy-contact-box">
          <h2>Questions About This Policy?</h2>
          <p>
            If you have any questions about how we handle your data, reach out
            to our team and we'll be happy to help.
          </p>
          <a href="/contact" className="cta-btn">
            Contact Us
          </a>
        </div>
      </section>
    </>
  );
}
