import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <h2 className="footer-logo">
            <img
              src="/images/assets/zestybite_logo.png"
              alt="ZestyBite Logo"
              width="150"
              height="50"
            />
          </h2>
          <p>
            Powered by modern technology, the food ordering industry simplifies
            meal selection and delivery by connecting users with a wide range of
            restaurants. It ensures convenience, transparency, and quality
            service in today's fast-paced lifestyle.
          </p>
          <div className="social-icons">
            <a href="https://www.facebook.com/">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://x.com/">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://www.linkedin.com/">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>
        <div className="footer-middle">
          <h3>COMPANY</h3>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/delivery">Delivery</Link>
            </li>
            <li>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms-conditions">Terms & Conditions</Link>
            </li>
          </ul>
        </div>
        <div className="footer-right">
          <h3>GET IN TOUCH</h3>
          <p>91-223-564-2565</p>
          <p>contact@ZestyBite.com</p>
          <Link to="/contact" className="contact">
            Contact Us
          </Link>
        </div>
      </div>
      <hr />
      <p className="copyright">
        © 2026 ZestyBite. All Rights Reserved. | Developed by Dnyaneshwari
        Mehetre
      </p>
    </footer>
  );
}
