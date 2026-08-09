import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './Settings.css';

export default function Settings({
  user,
  onBack,
  onLogout,
  onUsernameUpdated,
  onPrivacy,
  onAbout,
}) {
  const email =
    user?.email || 'No email available';

  const currentUsername =
    user?.user_metadata?.username ||
    user?.user_metadata?.display_name ||
    email.split('@')[0];

  const [username, setUsername] =
    useState(currentUsername);

  const [editingUsername, setEditingUsername] =
    useState(false);

  const [savingUsername, setSavingUsername] =
    useState(false);

  const [usernameMessage, setUsernameMessage] =
    useState('');

  useEffect(() => {
    setUsername(currentUsername);
  }, [currentUsername]);

  async function handleSaveUsername() {
  const cleanUsername = username.trim();

  if (!cleanUsername) {
    setUsernameMessage(
      'Username cannot be empty.'
    );
    return;
  }

  if (cleanUsername.length < 3) {
    setUsernameMessage(
      'Username must be at least 3 characters.'
    );
    return;
  }

  if (cleanUsername.length > 24) {
    setUsernameMessage(
      'Username must be 24 characters or less.'
    );
    return;
  }

  setSavingUsername(true);
  setUsernameMessage('');

  try {
    /* --------------------------------
       UPDATE PROFILE TABLE
    -------------------------------- */

    const {
      error: profileError,
    } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          username: cleanUsername,
          email: user.email,
        },
        {
          onConflict: 'id',
        }
      );

    if (profileError) {
      throw profileError;
    }

    /* --------------------------------
       UPDATE AUTH USER METADATA
    -------------------------------- */

    const {
      error: authError,
    } = await supabase.auth.updateUser({
      data: {
        username: cleanUsername,
      },
    });

    if (authError) {
      throw authError;
    }

    /* --------------------------------
       REFRESH APP USER
    -------------------------------- */

    if (onUsernameUpdated) {
      await onUsernameUpdated();
    }

    setEditingUsername(false);

    setUsernameMessage(
      'Username updated.'
    );
  } catch (error) {
    console.error(
      'Username update error:',
      error
    );

    setUsernameMessage(
      'Could not update username.'
    );
  } finally {
    setSavingUsername(false);
  }
}

  function handleCancelUsernameEdit() {
    setUsername(currentUsername);
    setUsernameMessage('');
    setEditingUsername(false);
  }

  function handleSendFeedback() {
    const subject = encodeURIComponent(
        'Stacked App Feedback'
    );

    const body = encodeURIComponent(
    `Hi,

    I have some feedback about Stacked:




    Account email: ${email}
    Username: ${currentUsername}

    Thanks!`
    );

    window.location.href =
        `mailto:jguzmannn05@gmail.com?subject=${subject}&body=${body}`;
    }

  return (
    <div className="settings-page">
      {/* HEADER */}

      <div className="settings-header">
        <button
          type="button"
          className="settings-back-btn"
          onClick={onBack}
          aria-label="Go back"
        >
          <i className="ti ti-chevron-left" />
        </button>

        <div>
          <span className="settings-eyebrow">
            STACKED
          </span>

          <h1>Settings</h1>
        </div>
      </div>

      {/* PROFILE */}

      <section className="settings-profile">
        <div className="settings-avatar">
          {currentUsername
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="settings-profile-info">
          <strong>
            {currentUsername}
          </strong>

          <span>{email}</span>
        </div>
      </section>

      {/* PROFILE SETTINGS */}

      <section className="settings-section">
        <div className="settings-section-label">
          PROFILE
        </div>

        <div className="settings-group">
          {!editingUsername ? (
            <button
              type="button"
              className="settings-row"
              onClick={() => {
                setEditingUsername(true);
                setUsernameMessage('');
              }}
            >
              <div className="settings-row-left">
                <div className="settings-icon">
                  <i className="ti ti-user-edit" />
                </div>

                <div className="settings-row-text">
                  <span>Username</span>

                  <small>
                    {currentUsername}
                  </small>
                </div>
              </div>

              <i className="ti ti-chevron-right settings-chevron" />
            </button>
          ) : (
            <div className="settings-username-editor">
              <label
                htmlFor="settings-username"
                className="settings-input-label"
              >
                Username
              </label>

              <input
                id="settings-username"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                maxLength={24}
                autoComplete="off"
                className="settings-input"
              />

              <div className="settings-username-actions">
                <button
                  type="button"
                  className="settings-secondary-btn"
                  onClick={
                    handleCancelUsernameEdit
                  }
                  disabled={
                    savingUsername
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="settings-save-btn"
                  onClick={
                    handleSaveUsername
                  }
                  disabled={
                    savingUsername
                  }
                >
                  {savingUsername
                    ? 'Saving...'
                    : 'Save'}
                </button>
              </div>

              {usernameMessage && (
                <p className="settings-username-message">
                  {usernameMessage}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* SUPPORT */}

      <section className="settings-section">
        <div className="settings-section-label">
          SUPPORT
        </div>

        <div className="settings-group">
          <button
            type="button"
            className="settings-row"
            onClick={handleSendFeedback}
          >
            <div className="settings-row-left">
              <div className="settings-icon">
                <i className="ti ti-message" />
              </div>

              <span>
                Send Feedback
              </span>
            </div>

            <i className="ti ti-chevron-right settings-chevron" />
          </button>

          <button
            type="button"
            className="settings-row"
            onClick={onPrivacy}
          >
            <div className="settings-row-left">
              <div className="settings-icon">
                <i className="ti ti-shield-lock" />
              </div>

              <span>
                Privacy Policy
              </span>
            </div>

            <i className="ti ti-chevron-right settings-chevron" />
          </button>

          <button
            type="button"
            className="settings-row"
            onClick={onAbout}
          >
            <div className="settings-row-left">
              <div className="settings-icon">
                <i className="ti ti-info-circle" />
              </div>

              <span>
                About Stacked
              </span>
            </div>

            <i className="ti ti-chevron-right settings-chevron" />
          </button>
        </div>
      </section>

      {/* ACCOUNT */}

      <section className="settings-section">
        <div className="settings-section-label">
          ACCOUNT
        </div>

        <div className="settings-group">
          <button
            type="button"
            className="settings-row"
            onClick={onLogout}
          >
            <div className="settings-row-left">
              <div className="settings-icon">
                <i className="ti ti-logout" />
              </div>

              <span>
                Sign Out
              </span>
            </div>
          </button>
        </div>
      </section>

      <div className="settings-footer">
        <img
          src="/stacked.png"
          alt=""
          className="settings-footer-logo"
        />

        <span>Stacked</span>
        <small>Version 1.0.0</small>
      </div>
    </div>
  );
}