import { Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ManageFoods from "./pages/ManageFoods";
import ManageOrders from "./pages/ManageOrders";
import ManageCategories from "./pages/ManageCategories";
import ManageCoupons from "./pages/ManageCoupons";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="foods" element={<ManageFoods />} />
        <Route path="orders" element={<ManageOrders />} />
        <Route path="categories" element={<ManageCategories />} />
        <Route path="coupons" element={<ManageCoupons />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
