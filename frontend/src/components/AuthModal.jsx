import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export default function AuthModal({ open, onClose }) {
  const { signup, login, googleLogin } = useAuth();
  const [mode, setMode] = useState("choose"); 
  const [agree, setAgree] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  if (!open) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!agree) return;
    setError("");
    try {
      await signup(form.name, form.email, form.password);
      alert(
        "Account created successfully! A confirmation email has been sent to your inbox.",
      );
      setForm({ name: "", email: "", password: "" });
      setAgree(false);
      setMode("choose");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!agree) return;
    setError("");
    try {
      await login(form.email, form.password);
      alert("Login successful!");
      setForm({ name: "", email: "", password: "" });
      setAgree(false);
      setMode("choose");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    }
  };

  const handleGoogle = async (credentialResponse) => {
    setError("");
    try {
      await googleLogin(credentialResponse.credential);
      setForm({ name: "", email: "", password: "" });
      setAgree(false);
      setMode("choose");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Google sign in failed");
    }
  };

  const googleButton = (text) =>
    import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
      <div className="google-btn-wrap">
        <GoogleLogin
          onSuccess={handleGoogle}
          onError={() => setError("Google sign in failed")}
          text={text}
          shape="pill"
          width="280"
        />
      </div>
    ) : null;

  return (
    <section id="signForm">
      <div
        className="auth-overlay"
        id="authOverlay"
        style={{ display: "flex" }}
      >
        <div className="auth-modal">
          <span className="close-btn" onClick={onClose}>
            &times;
          </span>

          {mode === "choose" ? (
            <div className="auth-form">
              <h2>Sign Up</h2>
              {error && <p className="admin-error">{error}</p>}

              {googleButton("signup_with")}
              <div className="auth-divider">
                <span>or</span>
              </div>
              <button type="button" onClick={() => setMode("signup")}>
                Sign up with email
              </button>

              <p className="switch-text">
                Already have an account?{" "}
                <span
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                >
                  Login here
                </span>
              </p>
            </div>
          ) : mode === "signup" ? (
            <form className="auth-form" onSubmit={handleSignup}>
              <h2>Sign Up</h2>
              {error && <p className="admin-error">{error}</p>}

              <input
                type="text"
                name="name"
                placeholder="Your name"
                required
                value={form.name}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Your email"
                required
                value={form.email}
                onChange={handleChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={form.password}
                onChange={handleChange}
              />

              <button type="submit" disabled={!agree}>
                Create account
              </button>
              <label className="agree-box">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span>
                  By continuing, I agree to the <a href="#">terms of use</a> &{" "}
                  <a href="#">privacy policy</a>
                </span>
              </label>

              <p className="switch-text">
                Already have an account?{" "}
                <span
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                >
                  Login here
                </span>
              </p>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleLogin}>
              <h2>Login</h2>
              {error && <p className="admin-error">{error}</p>}

              <input
                type="email"
                name="email"
                placeholder="Your email"
                required
                value={form.email}
                onChange={handleChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={form.password}
                onChange={handleChange}
              />
              <br />

              <button type="submit" disabled={!agree}>
                Login
              </button>
              <label className="agree-box">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <p>
                  By continuing, I agree to the <a href="#">terms of use</a> &{" "}
                  <a href="#">privacy policy</a>
                </p>
              </label>

              {googleButton("signin_with")}

              <p className="switch-text">
                Create new account?{" "}
                <span
                  onClick={() => {
                    setMode("choose");
                    setError("");
                  }}
                >
                  Click here
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
