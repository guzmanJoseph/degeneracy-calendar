import React from 'react';
import './About.css';

export default function About({ onBack }) {
  return (
    <div className="about-page">
      <div className="about-header">
        <button
          type="button"
          className="about-back-btn"
          onClick={onBack}
          aria-label="Go back"
        >
          <i className="ti ti-chevron-left" />
        </button>

        <span>About</span>
      </div>

      <div className="about-hero">
        <img
          src="/stacked.png"
          alt="Stacked"
          className="about-logo"
        />

        <h1>Stacked</h1>

        <p className="about-tagline">
          Track the game. Build your bankroll.
        </p>

        <span className="about-version">
          Version 1.0.0
        </span>
      </div>

      <div className="about-card">
        <h2>Built for poker players.</h2>

        <p>
          Stacked makes it easy to track your
          poker sessions, understand your
          performance, compete with friends,
          manage groups, and settle up after
          the game.
        </p>

        <p>
          Whether you're tracking a home game
          with friends or building a long-term
          bankroll, Stacked keeps everything in
          one place.
        </p>
      </div>

      <div className="about-card">
        <div className="about-feature">
          <i className="ti ti-chart-line" />

          <div>
            <strong>Track</strong>
            <span>
              Follow your sessions, profit,
              hours, and performance.
            </span>
          </div>
        </div>

        <div className="about-feature">
          <i className="ti ti-users" />

          <div>
            <strong>Compete</strong>
            <span>
              Create groups and see how you
              stack up against friends.
            </span>
          </div>
        </div>

        <div className="about-feature">
          <i className="ti ti-cash" />

          <div>
            <strong>Settle</strong>
            <span>
              Keep poker-night payouts simple
              and organized.
            </span>
          </div>
        </div>
      </div>

      <div className="about-footer">
        <span>Made for the table.</span>
        <small>© 2026 Stacked</small>
      </div>
    </div>
  );
}