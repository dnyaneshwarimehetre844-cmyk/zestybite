import { useState, useEffect } from "react";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../api/helpers";

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/foods", { params: { search: query } });
        setResults(res.data.items.slice(0, 8));
      } catch (err) {
        console.error(err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, open]);
  useEffect(() => {
    if (!open || !query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.post("/ai/search", { query });
        setResults(res.data.items.slice(0, 8));
      } catch (err) {
        console.error(err);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, open]);
  if (!open) return null;

  return (
    <div className="search-overlay active">
      <div className="search-header">
        <input
          type="text"
          id="searchInput"
          placeholder="Search for food..."
          autoComplete="off"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span
          onClick={() => {
            onClose();
            setQuery("");
          }}
          style={{ cursor: "pointer" }}
        >
          ✕
        </span>
      </div>

      <div className="search-results">
        {results.length === 0 && <p>No food found</p>}
        {results.map((food) => (
          <div className="search-food-card" key={food._id}>
            <div className="search-food-left">
              <h3>{food.name}</h3>
              <p>₹{food.price}</p>
              <p>⭐{food.star_rating}</p>
              <button
                className="add-btn"
                onClick={() => {
                  addToCart(food);
                  alert(food.name + " added to cart");
                }}
              >
                ADD
              </button>
            </div>
            <div className="search-food-right">
              <img src={getImageUrl(food.image)} width="120" alt={food.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
