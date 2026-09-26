import { useState, useEffect } from "react";
import api from "../api/axios";
import { getImageUrl } from "../api/helpers";

const emptyForm = {
  name: "",
  category: "",
  price: "",
  star_rating: 4.5,
  info: "",
  image: "",
  isAvailable: true,
};

export default function ManageFoods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const resetImagePick = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  };

  const loadFoods = async () => {
    setLoading(true);
    try {
      const res = await api.get("/foods/admin/all");
      setFoods(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    resetImagePick();
    setError("");
    setShowModal(true);
  };

  const openEdit = (food) => {
    setEditingId(food._id);
    setForm({
      name: food.name,
      category: food.category,
      price: food.price,
      star_rating: food.star_rating,
      info: food.info,
      image: food.image,
      isAvailable: food.isAvailable,
    });
    resetImagePick();
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!editingId && !imageFile && !form.image.trim()) {
      setError("Upload an image file, or paste an image URL/path below");
      return;
    }

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("category", form.category);
        formData.append("price", Number(form.price));
        formData.append("star_rating", Number(form.star_rating));
        formData.append("info", form.info);
        formData.append("isAvailable", form.isAvailable);
        formData.append("image", imageFile); 
        if (editingId) {
          await api.put(`/foods/${editingId}`, formData);
        } else {
          await api.post("/foods", formData);
        }
      } else {
        const payload = {
          ...form,
          price: Number(form.price),
          star_rating: Number(form.star_rating),
        };
        if (editingId) {
          await api.put(`/foods/${editingId}`, payload);
        } else {
          await api.post("/foods", payload);
        }
      }
      setShowModal(false);
      loadFoods();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save food item");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this food item?")) return;
    try {
      await api.delete(`/foods/${id}`);
      loadFoods();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const toggleTrending = async (food) => {
    try {
      await api.put(`/foods/${food._id}`, { isTrending: !food.isTrending });
      loadFoods();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update food item");
    }
  };

  const visibleFoods = foods.filter((f) =>
    (f.name + f.category).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
    <div className="fade-in">
      <div className="admin-toolbar">
        <div>
          <h1>Manage Foods</h1>
          <p className="admin-subtext">{foods.length} items on your menu</p>
        </div>
        <div className="admin-toolbar-actions">
          <input
            className="admin-search-input"
            placeholder="Search foods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="admin-btn" onClick={openAdd}>
            + Add Food Item
          </button>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Available</th>

                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleFoods.map((food) => (
                <tr key={food._id}>
                  <td>
                    <img src={getImageUrl(food.image)} alt={food.name} />
                  </td>
                  <td>{food.name}</td>
                  <td>{food.category}</td>
                  <td>₹{food.price}</td>
                  <td>⭐{food.star_rating}</td>
                  <td>
                    <span
                      className={`status-badge ${food.isAvailable ? "status-delivered" : "status-cancelled"}`}
                    >
                      {food.isAvailable ? "Yes" : "No"}
                    </span>
                  </td>

                  <td>
                    <button
                      className="admin-btn secondary"
                      onClick={() => openEdit(food)}
                    >
                      Edit
                    </button>{" "}
                    <button
                      className="admin-btn danger"
                      onClick={() => handleDelete(food._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleFoods.length === 0 && (
            <p className="empty-text">No food items found.</p>
          )}
        </div>
      )}

      {showModal && (
        <div
          className="admin-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="admin-modal fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{editingId ? "Edit Food Item" : "Add Food Item"}</h2>
            {error && <p className="admin-error">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Category</label>
                <input
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </div>

              <div className="row">
                <div className="admin-form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                </div>

                <div className="admin-form-group">
                  <label>Star Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.star_rating}
                    onChange={(e) =>
                      setForm({ ...form, star_rating: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />
                <p className="admin-form-hint">
                  Uploads are auto-resized and compressed. Or leave this empty
                  and paste an image URL/path below instead.
                </p>
                {(imagePreview || form.image) && (
                  <img
                    className="admin-image-preview"
                    src={imagePreview || getImageUrl(form.image)}
                    alt="Preview"
                  />
                )}
                <input
                  placeholder="...or paste: images/assets/food_1.png / https://..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  style={{ marginTop: "0.5rem" }}
                />
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={form.info}
                  onChange={(e) => setForm({ ...form, info: e.target.value })}
                ></textarea>
              </div>

              <div className="admin-form-group admin-checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) =>
                      setForm({ ...form, isAvailable: e.target.checked })
                    }
                  />
                  Available on storefront
                </label>
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn">
                  {editingId ? "Save Changes" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
