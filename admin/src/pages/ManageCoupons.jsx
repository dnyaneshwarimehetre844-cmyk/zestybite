import { useState, useEffect } from "react";

import api from "../api/axios";

const emptyForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderValue: "",
  maxDiscount: "",
  expiresAt: "",
  usageLimit: "",
  usagePerUser: "1",
  isActive: true,
};

function toDateInput(iso) {
  if (!iso) return "";

  return new Date(iso).toISOString().slice(0, 10);
}

function isExpired(iso) {
  return new Date(iso) < new Date();
}

export default function ManageCoupons() {
  const [coupons, setCoupons] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const loadCoupons = async () => {
    setLoading(true);

    try {
      const res = await api.get("/coupons");

      setCoupons(res.data.coupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openAdd = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setError("");
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setEditingId(coupon._id);

    setForm({
      code: coupon.code,

      discountType: coupon.discountType,

      discountValue: coupon.discountValue,

      minOrderValue: coupon.minOrderValue ?? "",

      maxDiscount: coupon.maxDiscount ?? "",

      expiresAt: toDateInput(coupon.expiresAt),

      usageLimit: coupon.usageLimit ?? "",

      usagePerUser: coupon.usagePerUser ?? "1",

      isActive: coupon.isActive,
    });

    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.code.trim()) {
      setError("Coupon code is required");
      return;
    }

    if (!form.expiresAt) {
      setError("Expiry date is required");
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),

      discountType: form.discountType,

      discountValue: Number(form.discountValue),

      minOrderValue: form.minOrderValue === "" ? 0 : Number(form.minOrderValue),

      maxDiscount: form.maxDiscount === "" ? null : Number(form.maxDiscount),

      expiresAt: form.expiresAt,

      usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),

      usagePerUser: form.usagePerUser === "" ? 1 : Number(form.usagePerUser),

      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await api.put(`/coupons/${editingId}`, payload);
      } else {
        await api.post("/coupons", payload);
      }

      setShowModal(false);

      await loadCoupons();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save coupon");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon?")) {
      return;
    }

    try {
      await api.delete(`/coupons/${id}`);

      await loadCoupons();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, {
        isActive: !coupon.isActive,
      });

      await loadCoupons();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update coupon");
    }
  };

  return (
    <>
      <div className="fade-in">
        <div className="admin-toolbar">
          <div>
            <h1>Manage Coupons</h1>

            <p className="admin-subtext">{coupons.length} coupons</p>
          </div>

          <div className="admin-toolbar-actions">
            <button className="admin-btn" onClick={openAdd}>
              + Add Coupon
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
                  <th>Code</th>

                  <th>Discount</th>

                  <th>Min Order</th>

                  <th>Usage</th>

                  <th>Per User</th>

                  <th>Expires</th>

                  <th>Status</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon.expiresAt);

                  return (
                    <tr key={coupon._id}>
                      <td>
                        <strong>{coupon.code}</strong>
                      </td>

                      <td>
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%${
                              coupon.maxDiscount
                                ? ` (max Rs ${coupon.maxDiscount})`
                                : ""
                            }`
                          : `Rs ${coupon.discountValue} flat`}
                      </td>

                      <td>Rs {coupon.minOrderValue || 0}</td>

                      <td>
                        {coupon.usedCount}

                        {coupon.usageLimit !== null
                          ? ` / ${coupon.usageLimit}`
                          : " / ∞"}
                      </td>

                      <td>{coupon.usagePerUser || 1}</td>

                      <td>
                        {toDateInput(coupon.expiresAt)}

                        {expired && (
                          <span className="admin-badge danger"> Expired</span>
                        )}
                      </td>

                      <td>
                        <button
                          className={`admin-btn ${
                            coupon.isActive ? "secondary" : ""
                          }`}
                          onClick={() => toggleActive(coupon)}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td>
                        <button
                          className="admin-btn secondary"
                          onClick={() => openEdit(coupon)}
                        >
                          Edit
                        </button>{" "}
                        <button
                          className="admin-btn danger"
                          onClick={() => handleDelete(coupon._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {coupons.length === 0 && (
              <p className="empty-text">
                No coupons yet — add one to show offers to customers.
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
              <h2>{editingId ? "Edit Coupon" : "Add Coupon"}</h2>

              {error && <p className="admin-error">{error}</p>}

              <form onSubmit={handleSubmit}>
                <div className="admin-modal-scroll">
                  <div className="admin-form-group">
                    <label>Coupon Code</label>

                    <input
                      required
                      placeholder="e.g. SAVE20"
                      value={form.code}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          code: e.target.value,
                        })
                      }
                      style={{
                        textTransform: "uppercase",
                      }}
                    />
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Discount Type</label>

                      <select
                        value={form.discountType}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            discountType: e.target.value,
                          })
                        }
                      >
                        <option value="percentage">Percentage (%)</option>

                        <option value="flat">Flat (Rs)</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label>Discount Value</label>

                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={
                          form.discountType === "percentage"
                            ? "e.g. 20"
                            : "e.g. 100"
                        }
                        value={form.discountValue}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            discountValue: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Min Order Value (Rs)</label>

                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={form.minOrderValue}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            minOrderValue: e.target.value,
                          })
                        }
                      />
                    </div>

                    {form.discountType === "percentage" && (
                      <div className="admin-form-group">
                        <label>Max Discount Cap (Rs)</label>

                        <input
                          type="number"
                          min="0"
                          placeholder="No cap"
                          value={form.maxDiscount}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              maxDiscount: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label>Expiry Date</label>

                      <input
                        required
                        type="date"
                        value={form.expiresAt}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            expiresAt: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Usage Limit (Total)</label>

                      <input
                        type="number"
                        min="1"
                        placeholder="Unlimited"
                        value={form.usageLimit}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            usageLimit: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Usage Per User</label>

                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={form.usagePerUser}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          usagePerUser: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-form-group admin-checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            isActive: e.target.checked,
                          })
                        }
                      />{" "}
                      Active
                    </label>
                  </div>
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
                    {editingId ? "Save Changes" : "Add Coupon"}
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
