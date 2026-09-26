import { useState, useEffect, useRef } from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../api/helpers";

export default function Account() {
  const { user, updateUser } = useAuth();
  const { openAuth } = useOutletContext() || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const loadOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get("/orders/my");
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  if (!user) {
    // Not logged in — send them home and pop the sign-in modal there.
    return <Navigate to="/" replace />;
  }

  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError("");
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await api.put("/auth/avatar", formData);
      updateUser({ avatar: res.data.user.avatar });
    } catch (err) {
      setAvatarError(
        err.response?.data?.message || "Couldn't upload that image, try again.",
      );
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  return (
    <section className="account-page fade-in-page">
      <div className="account-header">
        <div className="account-avatar-wrap">
          <div
            className="account-avatar"
            onClick={handleAvatarClick}
            role="button"
            tabIndex={0}
            aria-label="Change profile picture"
          >
            {user.avatar ? (
              <img src={getImageUrl(user.avatar)} alt={user.fullName} />
            ) : (
              user.fullName?.[0]?.toUpperCase()
            )}
          </div>
          <button
            type="button"
            className="account-avatar-edit-btn"
            onClick={handleAvatarClick}
            aria-label="Edit profile picture"
            disabled={avatarUploading}
          >
            {avatarUploading ? "…" : "✎"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </div>
        <div>
          <h1>{user.fullName}</h1>
          <p>{user.email}</p>
          {avatarError && <p className="account-avatar-error">{avatarError}</p>}
        </div>
      </div>

      <div className="account-stats">
        <div className="account-stat-card">
          <h4>Orders Placed</h4>
          <p>{orders.length}</p>
        </div>
        <div className="account-stat-card">
          <h4>Total Spent</h4>
          <p>₹{totalSpent}</p>
        </div>
        <div className="account-stat-card">
          <h4>Member Since</h4>
          <p>
            {new Date(
              orders[orders.length - 1]?.createdAt || Date.now(),
            ).getFullYear()}
          </p>
        </div>
      </div>

      <h2 className="account-section-title">Your Orders</h2>

      {loading ? (
        <p className="loading-text">Loading your orders...</p>
      ) : orders.length === 0 ? (
        <p className="empty-text">You haven't placed any orders yet.</p>
      ) : (
        <div className="account-orders-list">
          {orders.map((order) => (
            <div className="account-order-card" key={order._id}>
              <div className="account-order-top">
                <div>
                  <p className="account-order-date">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="account-order-items">
                    {order.items.map((i) => `${i.name} x${i.qty}`).join(", ")}
                  </p>
                </div>
                <div className="account-order-right">
                  <span className={`status-badge status-${order.status}`}>
                    {order.status.replace(/_/g, " ")}
                  </span>
                  <p className="account-order-total">₹{order.total}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
