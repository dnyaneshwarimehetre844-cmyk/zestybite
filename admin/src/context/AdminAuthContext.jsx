import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/axios";

const AdminAuthContext = createContext(null);

function readAdmin() {
  try {
    return JSON.parse(localStorage.getItem("admin_user")) || null;
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(readAdmin);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      if (user.role !== "admin") {
        throw new Error("This account does not have admin access.");
      }

      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_user", JSON.stringify(user));
      setAdmin(user);
      return user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setAdmin(null);
  }, []);

  const updateAdmin = useCallback((updatedUser) => {
    setAdmin((prev) => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem("admin_user", JSON.stringify(merged));
      return merged;
    });
  }, []);
  return (
    <AdminAuthContext.Provider
      value={{ admin, login, logout, updateAdmin, loading }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx)
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
