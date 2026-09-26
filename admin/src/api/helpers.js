
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

export function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean.startsWith("/images/uploads/")) return `${BACKEND_URL}${clean}`;
  return `${FRONTEND_URL}${clean}`;
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString();
}
