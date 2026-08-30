import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (isSignUp && password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      setMessage(
        error
          ? error.message
          : "Account created. Check your email if confirmation is required."
      );
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      }
    }

    setLoading(false);
  }

  async function handleForgotPassword() {
    setMessage("");

    if (!email) {
      setMessage("Enter your email first.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `https://stacked-poker.vercel.app/reset-password`,
    });

    setMessage(
      error
        ? error.message
        : "Password reset link sent. Check your email."
    );

    setLoading(false);
  }

  function toggleAuthMode() {
    setIsSignUp((prev) => !prev);
    setMessage("");
    setPassword("");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-brand">
          <img
            src="/stacked.png"
            alt="Stacked logo"
            className="app-logo"
          />

          <h1>Stacked</h1>

          <p className="auth-subtitle">
            Track your sessions, settle up with friends, and see who's really up.
          </p>
        </div>

        <form onSubmit={handleAuth} className="auth-form">

          <div className="auth-field">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <div className="auth-password-header">
              <label htmlFor="password">Password</label>

              {!isSignUp && (
                <button
                  type="button"
                  className="forgot-password-btn"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              )}
            </div>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              minLength="8"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-primary-btn"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isSignUp
              ? "Create Account"
              : "Log In"}
          </button>
        </form>

        {message && (
          <div className="auth-message">
            {message}
          </div>
        )}

        <div className="auth-divider">
          <span />
          <p>or</p>
          <span />
        </div>

        <p className="auth-switch-text">
          {isSignUp
            ? "Already have an account?"
            : "New to Stacked?"}

          <button
            type="button"
            className="auth-switch-btn"
            onClick={toggleAuthMode}
          >
            {isSignUp ? "Log in" : "Create an account"}
          </button>
        </p>
      </div>
    </div>
  );
}