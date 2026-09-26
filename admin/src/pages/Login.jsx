import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function Login() {
  const { login, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <>
      <div className="admin-login-page">
        <form className="admin-login-card fade-in" onSubmit={handleSubmit}>
          <div className="admin-login-logo">🍽️</div>
          <h2>ZestyBite Admin</h2>
          <p className="admin-login-sub">Sign in to manage your restaurant</p>

          {error && <p className="admin-error">{error}</p>}

          <label>Admin email</label>
          <input
            type="email"
            placeholder="admin@zestybite.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </>
  );
}
