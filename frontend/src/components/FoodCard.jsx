import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "../api/helpers";
import { useCart } from "../context/CartContext";
import api from "../api/axios";

export default function FoodCard({ item }) {
  const { addToCart } = useCart();
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <motion.div
        className="food-item"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        whileHover={{ y: -6, boxShadow: "0 12px 24px rgba(0,0,0,0.12)" }}
        onClick={() => setShowDetail(true)}
        style={{ cursor: "pointer" }}
      >
        <div className="food-img">
          <img src={getImageUrl(item.image)} alt={item.name} />
        </div>
        <div className="food-title">
          <h3>{item.name}</h3>
          <p>⭐{item.star_rating}</p>
        </div>
        <p className="price">₹{item.price}</p>
        <p className="info">{item.info}</p>
        <motion.button
          className="add-btn"
          whileTap={{ scale: 0.92 }}
          onClick={(e) => {
            e.stopPropagation(); // don't trigger the card's onClick (detail modal)
            addToCart(item);
          }}
        >
          Add to Cart
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showDetail && (
          <FoodDetailModal item={item} onClose={() => setShowDetail(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function FoodDetailModal({ item, onClose }) {
  const { addToCart } = useCart();
  const [current, setCurrent] = useState(item);
  const [qty, setQty] = useState(1);
  const [recommended, setRecommended] = useState([]);
  const [loadingRec, setLoadingRec] = useState(true);

  const loadRecommended = async (foodItem) => {
    setLoadingRec(true);
    try {
      const res = await api.get(
        `/foods?category=${encodeURIComponent(foodItem.category)}&limit=8`,
      );
      const items = (res.data.items || []).filter(
        (f) => f._id !== (foodItem._id || foodItem.id),
      );
      setRecommended(items);
    } catch (err) {
      console.error("Failed to load recommended items:", err);
      setRecommended([]);
    } finally {
      setLoadingRec(false);
    }
  };
  useState(() => {
    loadRecommended(current);
  }, []);

  const switchTo = (foodItem) => {
    setCurrent(foodItem);
    setQty(1);
    loadRecommended(foodItem);

    document
      .querySelector(".food-detail-modal")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(current);
    onClose();
  };

  return (
    <motion.div
      className="food-detail-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="food-detail-modal"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>

        <div className="food-detail-top">
          <div className="food-detail-img">
            <img src={getImageUrl(current.image)} alt={current.name} />
          </div>
          <div className="food-detail-info">
            <h2>{current.name}</h2>
            <p className="food-detail-rating">⭐ {current.star_rating}</p>
            <p className="food-detail-price">₹{current.price}</p>
            <p className="food-detail-desc">{current.info}</p>

            <div className="food-detail-qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                -
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}>+</button>
            </div>

            <button
              className="add-btn food-detail-add-btn"
              onClick={handleAddToCart}
            >
              Add {qty > 1 ? `${qty} to Cart` : "to Cart"} · ₹
              {current.price * qty}
            </button>
          </div>
        </div>

        <div className="food-detail-recommend">
          <h3>You may also like</h3>
          {loadingRec ? (
            <p className="empty-text">Loading...</p>
          ) : recommended.length === 0 ? (
            <p className="empty-text">No other items in this category yet.</p>
          ) : (
            <div className="food-detail-recommend-scroll">
              {recommended.map((food) => (
                <div
                  key={food._id}
                  className="food-detail-recommend-card"
                  onClick={() => switchTo(food)}
                >
                  <img src={getImageUrl(food.image)} alt={food.name} />
                  <p className="food-detail-recommend-name">{food.name}</p>
                  <p className="food-detail-recommend-price">₹{food.price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
