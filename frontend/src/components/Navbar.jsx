import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "../api/helpers";

export default function Navbar({ onOpenSearch, onOpenAuth }) {
  const { cartCount } = useCart(0);
  const { user, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  const isActive = (path) => location.pathname === path;

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="logo">
          <Link to="/" onClick={closeMenu}>
            <img
              src="/images/assets/zestybite_logo.png"
              alt="ZestyBite Logo"
              width="150"
              height="50"
            />
          </Link>
        </div>

        <div
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
        {menuOpen && (
          <div className="nav-backdrop active" onClick={closeMenu}></div>
        )}
        <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
          <div className="nav-center">
            <Link
              to="/"
              onClick={closeMenu}
              className={`nav-link ${isActive("/") ? "active" : ""}`}
            >
              Home
            </Link>

            <a href="/#Explore-Menu" onClick={closeMenu} className="nav-link">
              Menu
            </a>

            <a href="/#app-download" onClick={closeMenu} className="nav-link">
              Mobile-App
            </a>

            <Link
              to="/contact"
              onClick={closeMenu}
              className={`nav-link ${isActive("/contact") ? "active" : ""}`}
            >
              Contact Us
            </Link>
          </div>

          <div className="nav-right">
            <a
              onClick={() => {
                onOpenSearch();
                closeMenu();
              }}
              style={{ cursor: "pointer" }}
            >
              <img
                src="/images/assets/search_icon.png"
                className="navbar-search-icon"
                alt="search"
              />

              <span className="nav-right-label">Search</span>
            </a>

            <Link to="/cart" onClick={closeMenu}>
              <motion.img
                src="/images/assets/basket_icon.png"
                className={`basket_icon ${isActive("/cart") ? "active" : ""}`}
                alt="cart"
                key={cartCount}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.35, 1] }}
                transition={{ duration: 0.35 }}
              />

              <span className="nav-right-label">Cart</span>

              {" ("}

              <AnimatePresence mode="popLayout">
                <motion.span
                  key={cartCount}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: "inline-block" }}
                >
                  {cartCount}
                </motion.span>
              </AnimatePresence>

              {")"}
            </Link>

            {user ? (
              <>
                <Link
                  to="/account"
                  onClick={closeMenu}
                  className={`user-info ${
                    isActive("/account") ? "active" : ""
                  }`}
                >
                  {user.avatar ? (
                    <img
                      src={getImageUrl(user.avatar)}
                      className="user-icon"
                      alt="user"
                    />
                  ) : (
                    <img
                      src="/images/assets/circle-user.svg"
                      className="user-icon"
                      alt="user"
                    />
                  )}

                  <span className="nav-right-label">Profile</span>
                </Link>

                <button
                  className="signin-btn"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                className="signin-btn"
                onClick={() => {
                  onOpenAuth();
                  closeMenu();
                }}
              >
                Sign Up
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
