import React from 'react';
import './PrivacyPolicy.css';

export default function PrivacyPolicy({ onBack }) {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <button
          type="button"
          className="legal-back-btn"
          onClick={onBack}
          aria-label="Go back"
        >
          <i className="ti ti-chevron-left" />
        </button>

        <div>
          <span className="legal-eyebrow">
            STACKED
          </span>

          <h1>Privacy Policy</h1>
        </div>
      </div>

      <div className="legal-card">
        <p className="legal-updated">
          Last updated: August 9, 2026
        </p>

        <section>
          <h2>Overview</h2>

          <p>
            Stacked is a poker tracking and
            management app designed to help
            users record poker sessions, track
            performance, participate in groups,
            view leaderboards, and manage game
            payouts.
          </p>

          <p>
            This Privacy Policy explains what
            information Stacked collects, how
            that information is used, and the
            choices available to you.
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>

          <p>
            When you create and use a Stacked
            account, we may collect information
            you provide directly, including your
            email address, username, and account
            information.
          </p>

          <p>
            Stacked also stores information you
            choose to enter into the app, such as
            poker sessions, buy-ins, cash-outs,
            session duration, notes, group
            participation, and payout information.
          </p>
        </section>

        <section>
          <h2>How We Use Information</h2>

          <p>
            We use your information to provide
            and operate Stacked, maintain your
            account, save your poker activity,
            calculate statistics, provide group
            and leaderboard functionality, and
            improve the app.
          </p>
        </section>

        <section>
          <h2>Data Storage</h2>

          <p>
            Stacked uses third-party
            infrastructure and database services
            to authenticate users and securely
            store application data.
          </p>
        </section>

        <section>
          <h2>Sharing</h2>

          <p>
            Certain information you choose to
            make available through Stacked's
            social features, such as your
            username and applicable leaderboard
            or group statistics, may be visible
            to other Stacked users.
          </p>

          <p>
            We do not sell your personal
            information.
          </p>
        </section>

        <section>
          <h2>Data Retention</h2>

          <p>
            Information associated with your
            account may be retained while your
            account remains active or as needed
            to provide Stacked's services.
          </p>
        </section>

        <section>
          <h2>Your Choices</h2>

          <p>
            You may update certain account
            information through Stacked's
            settings. You may also request
            deletion of your account and
            associated data.
          </p>
        </section>

        <section>
          <h2>Children's Privacy</h2>

          <p>
            Stacked is not intended for children
            under 13, and we do not knowingly
            collect personal information from
            children under 13.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>

          <p>
            We may update this Privacy Policy as
            Stacked changes. The date at the top
            of this page indicates when the
            policy was most recently updated.
          </p>
        </section>

        <section>
          <h2>Contact</h2>

          <p>
            If you have questions about this
            Privacy Policy, please contact us
            through the feedback option in
            Stacked.
          </p>
        </section>
      </div>
    </div>
  );
}