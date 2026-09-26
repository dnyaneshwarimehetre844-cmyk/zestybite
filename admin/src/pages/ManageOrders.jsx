import { useState, useEffect } from "react";
import api from "../api/axios";
import { formatDate } from "../api/helpers";

const STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders");
      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const visibleOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <>
      <div className="fade-in">
        <div className="admin-page-header">
          <h1>Manage Orders</h1>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <h4>Total Orders</h4>
            <p>{orders.length}</p>
          </div>
          <div className="admin-stat-card">
            <h4>Pending</h4>
            <p>{orders.filter((o) => o.status === "pending").length}</p>
          </div>
          <div className="admin-stat-card">
            <h4>Delivered</h4>
            <p>{orders.filter((o) => o.status === "delivered").length}</p>
          </div>
          <div className="admin-stat-card">
            <h4>Revenue</h4>
            <p>₹{totalRevenue}</p>
          </div>
        </div>

        <div className="admin-toolbar">
          <div className="admin-filter-chips">
            {["all", ...STATUSES].map((s) => (
              <button
                key={s}
                className={`admin-chip ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Placed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      {order.user?.fullName}
                      <br />
                      <small>{order.user?.email}</small>
                    </td>
                    <td>
                      {order.items.map((i) => `${i.name} x${i.qty}`).join(", ")}
                    </td>
                    <td>₹{order.total}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className={`status-badge status-${order.status}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visibleOrders.length === 0 && (
              <p className="empty-text">No orders match this filter.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
