import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetPassword(e) {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated successfully!");

    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img
          src="/stacked.png"
          alt="Stacked logo"
          className="app-logo"
        />

        <h1>Reset Password</h1>

        <p className="auth-subtitle">
          Enter your new password below.
        </p>

        <form onSubmit={handleResetPassword} className="auth-form">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength="8"
            required
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength="8"
            required
          />

          <button
            type="submit"
            className="auth-primary-btn"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}