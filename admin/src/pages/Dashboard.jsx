import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { formatDate } from "../api/helpers";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function Dashboard() {
  const { admin } = useAdminAuth();
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [foodsRes, ordersRes] = await Promise.all([
          api.get("/foods/admin/all?limit=500"),
          api.get("/orders"),
        ]);
        setFoods(foodsRes.data.items || []);
        setOrders(ordersRes.data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const availableFoods = foods.filter((f) => f.isAvailable).length;
  const recentOrders = orders.slice(0, 6);

  return (
    <>
      <div className="fade-in">
        <div className="admin-page-header">
          <div>
            <h1>Welcome back, {admin?.fullName?.split(" ")[0] || "Admin"} </h1>
            <p className="admin-subtext">
              Here's how ZestyBite is doing today.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="loading-text">Loading dashboard...</p>
        ) : (
          <>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <h4>Total Revenue</h4>
                <p>₹{revenue}</p>
              </div>
              <div className="admin-stat-card">
                <h4>Total Orders</h4>
                <p>{orders.length}</p>
              </div>
              <div className="admin-stat-card">
                <h4>Pending Orders</h4>
                <p>{pendingCount}</p>
              </div>
              <div className="admin-stat-card">
                <h4>Menu Items</h4>
                <p>
                  {availableFoods}
                  <span className="admin-stat-sub"> / {foods.length}</span>
                </p>
              </div>
            </div>

            <div className="admin-dash-grid">
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <h3>Recent Orders</h3>
                  <Link to="/orders" className="admin-link">
                    View all →
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <p className="empty-text">No orders yet.</p>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Total</th>
                          <th>Placed</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order._id}>
                            <td>{order.user?.fullName || "—"}</td>
                            <td>₹{order.total}</td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td>
                              <span
                                className={`status-badge status-${order.status}`}
                              >
                                {order.status.replace(/_/g, " ")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header">
                  <h3>Quick Actions</h3>
                </div>
                <div className="admin-quick-actions">
                  <Link to="/foods" className="admin-btn">
                    + Add Food Item
                  </Link>
                  <Link to="/orders" className="admin-btn secondary">
                    Manage Orders
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
