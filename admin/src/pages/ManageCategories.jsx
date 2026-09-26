import { useState, useEffect } from "react";
import api from "../api/axios";
import { getImageUrl } from "../api/helpers";

const emptyForm = { name: "", image: "" };

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");

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

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories");
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    resetImagePick();
    setError("");
    setShowModal(true);
  };

  const openEdit = (category) => {
    setEditingId(category._id);
    setForm({ name: category.name, image: category.image });
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
        formData.append("image", imageFile);

        if (editingId) {
          await api.put(`/categories/${editingId}`, formData);
        } else {
          await api.post("/categories", formData);
        }
      } else {
        const payload = { name: form.name, image: form.image };
        if (editingId) {
          await api.put(`/categories/${editingId}`, payload);
        } else {
          await api.post("/categories", payload);
        }
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <>
      <div className="fade-in">
        <div className="admin-toolbar">
          <div>
            <h1>Manage Categories</h1>
            <p className="admin-subtext">{categories.length} categories</p>
          </div>
          <div className="admin-toolbar-actions">
            <button className="admin-btn" onClick={openAdd}>
              + Add Category
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      <img src={getImageUrl(cat.image)} alt={cat.name} />
                    </td>
                    <td>{cat.name}</td>
                    <td>
                      <button
                        className="admin-btn secondary"
                        onClick={() => openEdit(cat)}
                      >
                        Edit
                      </button>{" "}
                      <button
                        className="admin-btn danger"
                        onClick={() => handleDelete(cat._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {categories.length === 0 && (
              <p className="empty-text">
                No categories yet — add one so it can show up with a picture on
                the storefront's category grid. (Foods can still use any
                category name as free text either way.)
              </p>
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
              <h2>{editingId ? "Edit Category" : "Add Category"}</h2>
              {error && <p className="admin-error">{error}</p>}

              <form onSubmit={handleSubmit}>
                <div className="admin-form-group">
                  <label>Name</label>
                  <input
                    required
                    placeholder="e.g. Pizza"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <p className="admin-form-hint">
                    Should match the category name used on food items so it
                    filters correctly.
                  </p>
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
                    placeholder="...or paste: images/assets/menu_1.png / https://..."
                    value={form.image}
                    onChange={(e) =>
                      setForm({ ...form, image: e.target.value })
                    }
                    style={{ marginTop: "0.5rem" }}
                  />
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
                    {editingId ? "Save Changes" : "Add Category"}
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
