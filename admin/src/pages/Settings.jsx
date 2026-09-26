import { useState } from "react";

import api from "../api/axios";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function Settings() {
  const { admin, updateAdmin } = useAdminAuth();

  const [newEmail, setNewEmail] = useState(admin?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      const payload = { currentPassword };
      if (newEmail && newEmail !== admin?.email) payload.newEmail = newEmail;
      if (newPassword) payload.newPassword = newPassword;

      const res = await api.put("/auth/profile", payload);

      updateAdmin(res.data.user);
      setSuccess("Your email/password have been updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="admin-page-header">
        <h1>Account Settings</h1>
        <p className="admin-subtext">
          Change the email and password used to sign in to this admin panel.
          This is stored on your admin account in MongoDB and can be updated any
          time.
        </p>
      </div>

      <form className="admin-settings-card" onSubmit={handleSubmit}>
        <div className="admin-form-group">
          <label htmlFor="new-email">Email</label>
          <input
            id="new-email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="admin@zestybite.com"
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="new-password">New Password</label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="confirm-password">Confirm New Password</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            disabled={!newPassword}
          />
        </div>

        <hr className="admin-settings-divider" />

        <div className="admin-form-group">
          <label htmlFor="current-password">
            Current Password (required to save changes)
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
            required
          />
        </div>

        {error && <p className="admin-error">{error}</p>}
        {success && <p className="admin-success">{success}</p>}

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
