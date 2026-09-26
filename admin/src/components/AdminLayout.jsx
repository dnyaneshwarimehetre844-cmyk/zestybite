import { Outlet, NavLink, Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true, icon: "📊" },
  { to: "/foods", label: "Manage Foods", icon: "🍔" },
  { to: "/categories", label: "Manage Categories", icon: "🗂️" },
  { to: "/coupons", label: "Manage Coupons", icon: "🏷️" },
  { to: "/orders", label: "Manage Orders", icon: "🧾" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <span className="admin-brand-mark">🍽️</span>
            <h3>ZestyBite Admin</h3>
          </div>

          <nav className="admin-nav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <div className="admin-whoami">
              <div className="admin-avatar">
                {admin.fullName?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <p className="admin-whoami-name">{admin.fullName}</p>
                <p className="admin-whoami-email">{admin.email}</p>
              </div>
            </div>
            <button onClick={logout}>Sign Out</button>
          </div>
        </aside>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
