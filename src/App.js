import React, { useEffect, useState } from 'react';
import './App.css';

import { supabase } from './supabaseClient';
import Auth from './Auth';

import { useData } from './hooks/useData';

import Dashboard from './pages/Dashboard';
import Poker from './pages/Poker';
import Calendar from './pages/Calendar';
import Leaderboard from './pages/Leaderboard';
import Friends from './pages/Friends';
import Groups from './pages/Groups';
import Payouts from './pages/Payouts';
import SharedGame from './pages/SharedGame';

import AddModal from './components/AddModal';

const NAV = [
  {
    id: 'dashboard',
    icon: 'ti-layout-dashboard',
    label: 'Home',
  },
  {
    id: 'poker',
    icon: 'ti-cards',
    label: 'Sessions',
  },
  {
    id: 'payouts',
    icon: 'ti-cash',
    label: 'Payouts',
  },
  {
    id: 'leaderboard',
    icon: 'ti-trophy',
    label: 'Ranks',
  },
  {
    id: 'calendar',
    icon: 'ti-calendar',
    label: 'Calendar',
  },
  {
    id: 'groups',
    icon: 'ti-circles',
    label: 'Groups',
  },
];

/* --------------------------------
   READ URL
-------------------------------- */

const pathParts = window.location.pathname
  .split('/')
  .filter(Boolean);

/* Public game result link:
   /game/ABC123
*/

const isSharedGame =
  pathParts[0] === 'game' &&
  Boolean(pathParts[1]);

const sharedGameCode =
  isSharedGame
    ? pathParts[1]
    : null;

/* Group invitation:
   /join/GROUP_ID
*/

const isGroupInvite =
  pathParts[0] === 'join' &&
  Boolean(pathParts[1]);

const invitedGroupId =
  isGroupInvite
    ? pathParts[1]
    : null;

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState('dashboard');

  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const [joiningGroup, setJoiningGroup] = useState(false);
  const [joinError, setJoinError] = useState('');

  const {
    data,
    addPoker,
    deletePoker,
    editPoker,
  } = useData(session?.user);

  /* --------------------------------
     AUTH
  -------------------------------- */

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      });

    const { data: authListener } =
      supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          setSession(nextSession);
        }
      );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /* --------------------------------
     GROUP INVITE
  -------------------------------- */

  useEffect(() => {
    if (!session?.user) return;
    if (!invitedGroupId) return;

    let cancelled = false;

    async function joinInvitedGroup() {
      setJoiningGroup(true);
      setJoinError('');

      /*
        First check whether this user
        already belongs to the group.
      */

      const {
        data: existingMembership,
        error: membershipError,
      } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('group_id', invitedGroupId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (membershipError) {
        console.error(
          'Membership check error:',
          membershipError
        );
      }

      /*
        If they are NOT already a member,
        add them.
      */

      if (!existingMembership) {
        const { error } = await supabase
          .from('group_members')
          .insert({
            group_id: invitedGroupId,
            user_id: session.user.id,
            role: 'member',
          });

        if (cancelled) return;

        if (error) {
          console.error(
            'Invite join error:',
            error
          );

          setJoinError(
            'Could not join this group. The invite may be invalid or expired.'
          );

          setJoiningGroup(false);
          return;
        }
      }

      /*
        Join succeeded.

        Open Groups and clean the
        /join/... URL from the browser.
      */

      setTab('groups');

      window.history.replaceState(
        {},
        '',
        '/'
      );

      setJoiningGroup(false);
    }

    joinInvitedGroup();

    return () => {
      cancelled = true;
    };
  }, [session?.user]);

  /* --------------------------------
     MODALS
  -------------------------------- */

  function resetModals() {
    setModalOpen(false);
    setSettingsOpen(false);
    setEditingEntry(null);
  }

  function handleSubmit(entry) {
    const {
      type,
      ...cleanEntry
    } = entry;

    if (
      editingEntry?.type === 'poker'
    ) {
      editPoker(
        editingEntry.id,
        cleanEntry
      );
    } else {
      addPoker(entry);
    }

    resetModals();
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    resetModals();
  }

  /* --------------------------------
     PUBLIC SHARED GAME
  -------------------------------- */

  if (isSharedGame) {
    return (
      <SharedGame
        shareCode={sharedGameCode}
      />
    );
  }

  /* --------------------------------
     INITIAL LOADING
  -------------------------------- */

  if (loading) {
    return (
      <div className="app-loading">
        Loading...
      </div>
    );
  }

  /* --------------------------------
     NOT LOGGED IN

     IMPORTANT:
     We DO NOT remove /join/... here.

     This means the invite survives
     login/signup.
  -------------------------------- */

  if (!session) {
    return <Auth />;
  }

  /* --------------------------------
     JOINING FROM INVITE
  -------------------------------- */

  if (joiningGroup) {
    return (
      <div className="invite-loading">
        <img
          src="/stacked.png"
          alt="Stacked"
          className="invite-loading-logo"
        />

        <span className="invite-loading-label">
          Stacked
        </span>

        <h2>
          Joining group...
        </h2>

        <p>
          Setting up your invitation.
        </p>
      </div>
    );
  }

  /* --------------------------------
     INVITE ERROR
  -------------------------------- */

  if (joinError) {
    return (
      <div className="invite-error-page">
        <img
          src="/stacked.png"
          alt="Stacked"
          className="invite-loading-logo"
        />

        <h2>
          Couldn't Join Group
        </h2>

        <p>
          {joinError}
        </p>

        <button
          type="button"
          className="invite-error-btn"
          onClick={() => {
            window.history.replaceState(
              {},
              '',
              '/'
            );

            setJoinError('');
            setTab('groups');
          }}
        >
          Go to Groups
        </button>
      </div>
    );
  }

  /* --------------------------------
     MAIN APP
  -------------------------------- */

  return (
    <div className="app-shell">
      {/* TOP BAR */}

      <div className="top-bar">
        <div className="app-title">
          <img
            src="/stacked.png"
            alt="Stacked logo"
            className="nav-logo"
          />

          <span>
            Stacked
          </span>
        </div>

        <button
          className="settings-btn"
          type="button"
          onClick={() =>
            setSettingsOpen(true)
          }
          aria-label="Open settings"
        >
          <i
            className="ti ti-settings"
            aria-hidden="true"
          />
        </button>
      </div>

      {/* PAGE CONTENT */}

      <main className="main">
        {tab === 'dashboard' && (
          <Dashboard
            data={data}
          />
        )}

        {tab === 'poker' && (
          <Poker
            data={data.poker}
            onDelete={deletePoker}
            onEdit={(pokerSession) => {
              setEditingEntry({
                ...pokerSession,
                type: 'poker',
              });

              setModalOpen(true);
            }}
          />
        )}

        {tab === 'payouts' && (
          <Payouts
            user={session.user}
          />
        )}

        {tab === 'leaderboard' && (
          <Leaderboard
            user={session.user}
          />
        )}

        {tab === 'friends' && (
          <Friends
            user={session.user}
          />
        )}

        {tab === 'groups' && (
          <Groups
            user={session.user}
          />
        )}

        {tab === 'calendar' && (
          <Calendar
            poker={data.poker}
          />
        )}
      </main>

      {/* ADD SESSION BUTTON */}

      {!modalOpen &&
        !settingsOpen && (
          <div className="fab-stack">
            <button
              className="fab"
              type="button"
              onClick={() => {
                setEditingEntry(null);
                setModalOpen(true);
              }}
              aria-label="Add poker session"
            >
              <i
                className="ti ti-plus"
                aria-hidden="true"
              />
            </button>
          </div>
        )}

      {/* BOTTOM NAV */}

      <nav
        className="bottom-nav"
        aria-label="Main navigation"
      >
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`nav-btn${
              tab === n.id
                ? ' active'
                : ''
            }`}
            type="button"
            onClick={() =>
              setTab(n.id)
            }
            aria-current={
              tab === n.id
                ? 'page'
                : undefined
            }
          >
            <i
              className={`ti ${n.icon}`}
              aria-hidden="true"
            />

            <span>
              {n.label}
            </span>
          </button>
        ))}
      </nav>

      {/* ADD / EDIT SESSION */}

      {modalOpen && (
        <AddModal
          user={session.user}
          initialBet={editingEntry}
          onSubmit={handleSubmit}
          onClose={resetModals}
        />
      )}

      {/* SETTINGS */}

      {settingsOpen && (
        <div
          className="settings-overlay"
          onClick={() =>
            setSettingsOpen(false)
          }
        >
          <div
            className="settings-sheet"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="sheet-handle" />

            <h3>
              Settings
            </h3>

            <button
              className="settings-item"
              type="button"
              onClick={handleLogout}
            >
              <i
                className="ti ti-logout"
                aria-hidden="true"
              />

              <span>
                Sign Out
              </span>
            </button>

            <button
              className="settings-item"
              type="button"
              onClick={() =>
                setSettingsOpen(false)
              }
            >
              <i
                className="ti ti-x"
                aria-hidden="true"
              />

              <span>
                Close
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}