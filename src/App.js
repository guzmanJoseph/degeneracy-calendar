import React, { useEffect, useState } from 'react';
import './App.css';

import { supabase } from './supabaseClient';
import Auth from './Auth';

import { useData } from './hooks/useData';

import PrivacyPolicy from './pages/PrivacyPolicy';
import About from './pages/About';
import Support from './pages/Support';

import Dashboard from './pages/Dashboard';
import Poker from './pages/Poker';
import Calendar from './pages/Calendar';
import Leaderboard from './pages/Leaderboard';
import Friends from './pages/Friends';
import Groups from './pages/Groups';
import Payouts from './pages/Payouts';
import SharedGame from './pages/SharedGame';
import Settings from './pages/Settings';

import AddModal from './components/AddModal';


/* =========================================
   MAIN NAVIGATION
========================================= */

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


/* =========================================
   READ URL
========================================= */

const pathParts = window.location.pathname
  .split('/')
  .filter(Boolean);


/* -----------------------------------------
   PUBLIC GAME RESULT

   Example:
   /game/ABC123
----------------------------------------- */

const isSharedGame =
  pathParts[0] === 'game' &&
  Boolean(pathParts[1]);

const sharedGameCode =
  isSharedGame
    ? pathParts[1]
    : null;


/* -----------------------------------------
   PUBLIC SUPPORT PAGE

   Example:
   /support
----------------------------------------- */

const isSupportPage =
  pathParts[0] === 'support';

  const isPrivacyPage =
  pathParts[0] === 'privacy';


/* -----------------------------------------
   GROUP INVITATION

   Example:
   /join/GROUP_ID
----------------------------------------- */

const isGroupInvite =
  pathParts[0] === 'join' &&
  Boolean(pathParts[1]);

const invitedGroupId =
  isGroupInvite
    ? pathParts[1]
    : null;


/* =========================================
   APP
========================================= */

export default function App() {
  const [session, setSession] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [tab, setTab] =
    useState('dashboard');

  const [previousTab, setPreviousTab] =
    useState('dashboard');

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingEntry, setEditingEntry] =
    useState(null);

  const [joiningGroup, setJoiningGroup] =
    useState(false);

  const [joinError, setJoinError] =
    useState('');


  /* =========================================
     DATA
  ========================================= */

  const {
    data,
    addPoker,
    deletePoker,
    editPoker,
  } = useData(session?.user);


  /* =========================================
     AUTH
  ========================================= */

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


  /* =========================================
     GROUP INVITE
  ========================================= */

  useEffect(() => {
    if (!session?.user) return;
    if (!invitedGroupId) return;

    let cancelled = false;

    async function joinInvitedGroup() {
      setJoiningGroup(true);
      setJoinError('');


      /* -------------------------------------
         CHECK EXISTING MEMBERSHIP
      ------------------------------------- */

      const {
        data: existingMembership,
        error: membershipError,
      } = await supabase
        .from('group_members')
        .select('group_id')
        .eq(
          'group_id',
          invitedGroupId
        )
        .eq(
          'user_id',
          session.user.id
        )
        .maybeSingle();

      if (cancelled) return;

      if (membershipError) {
        console.error(
          'Membership check error:',
          membershipError
        );
      }


      /* -------------------------------------
         JOIN GROUP IF NEEDED
      ------------------------------------- */

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


      /* -------------------------------------
         SUCCESS
      ------------------------------------- */

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
  }, [
    session?.user,
  ]);


  /* =========================================
     MODAL HELPERS
  ========================================= */

  function resetModal() {
    setModalOpen(false);
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

    resetModal();
  }


  /* =========================================
     LOGOUT
  ========================================= */

  async function handleLogout() {
    await supabase.auth.signOut();

    resetModal();

    setTab('dashboard');
  }


  /* =========================================
     REFRESH SESSION
  ========================================= */

  async function refreshSession() {
    const {
      data: {
        session: nextSession,
      },
    } = await supabase.auth.getSession();

    setSession(nextSession);
  }


  /* =========================================
     SETTINGS NAVIGATION
  ========================================= */

  function openSettings() {
    if (
      ![
        'settings',
        'privacy',
        'about',
      ].includes(tab)
    ) {
      setPreviousTab(tab);
    }

    setTab('settings');
  }


  function closeSettings() {
    setTab(
      previousTab || 'dashboard'
    );
  }


  /* =========================================
     UTILITY PAGE CHECK
  ========================================= */

  const isUtilityPage = [
    'settings',
    'privacy',
    'about',
  ].includes(tab);


  /* =========================================
     PUBLIC SUPPORT PAGE
  ========================================= */

  /*
    This goes BEFORE login checks so Apple
    and users can open /support without
    having a Stacked account.
  */

  if (isSupportPage) {
    return <Support />;
  }

  if (isPrivacyPage) {
  return <PrivacyPolicy />;
}



  /* =========================================
     PUBLIC SHARED GAME
  ========================================= */

  if (isSharedGame) {
    return (
      <SharedGame
        shareCode={sharedGameCode}
      />
    );
  }


  /* =========================================
     INITIAL LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="app-loading">
        Loading...
      </div>
    );
  }


  /* =========================================
     NOT LOGGED IN
  ========================================= */

  /*
    /join/... intentionally stays in the URL
    while the user signs in or creates an
    account.

    After authentication, the invite effect
    above handles joining the group.
  */

  if (!session) {
    return <Auth />;
  }


  /* =========================================
     JOINING FROM INVITE
  ========================================= */

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


  /* =========================================
     INVITE ERROR
  ========================================= */

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


  /* =========================================
     MAIN APP
  ========================================= */

  return (
    <div className="app-shell">


      {/* =====================================
          TOP BAR
      ===================================== */}

      {!isUtilityPage && (
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
            onClick={openSettings}
            aria-label="Open settings"
          >
            <i
              className="ti ti-settings"
              aria-hidden="true"
            />
          </button>
        </div>
      )}


      {/* =====================================
          PAGE CONTENT
      ===================================== */}

      <main className="main">


        {/* DASHBOARD */}

        {tab === 'dashboard' && (
          <Dashboard
            data={data}
          />
        )}


        {/* POKER */}

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


        {/* PAYOUTS */}

        {tab === 'payouts' && (
          <Payouts
            user={session.user}
          />
        )}


        {/* LEADERBOARD */}

        {tab === 'leaderboard' && (
          <Leaderboard
            user={session.user}
          />
        )}


        {/* FRIENDS */}

        {tab === 'friends' && (
          <Friends
            user={session.user}
          />
        )}


        {/* GROUPS */}

        {tab === 'groups' && (
          <Groups
            user={session.user}
          />
        )}


        {/* CALENDAR */}

        {tab === 'calendar' && (
          <Calendar
            poker={data.poker}
          />
        )}


        {/* SETTINGS */}

        {tab === 'settings' && (
          <Settings
            user={session.user}
            onBack={closeSettings}
            onLogout={handleLogout}
            onUsernameUpdated={
              refreshSession
            }
            onPrivacy={() =>
              setTab('privacy')
            }
            onAbout={() =>
              setTab('about')
            }
          />
        )}


        {/* PRIVACY */}

        {tab === 'privacy' && (
          <PrivacyPolicy
            onBack={() =>
              setTab('settings')
            }
          />
        )}


        {/* ABOUT */}

        {tab === 'about' && (
          <About
            onBack={() =>
              setTab('settings')
            }
          />
        )}
      </main>


      {/* =====================================
          FLOATING ADD BUTTON
      ===================================== */}

      {!modalOpen &&
        !isUtilityPage && (
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


      {/* =====================================
          BOTTOM NAVIGATION
      ===================================== */}

      {!isUtilityPage && (
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
      )}


      {/* =====================================
          ADD / EDIT SESSION MODAL
      ===================================== */}

      {modalOpen && (
        <AddModal
          user={session.user}
          initialBet={editingEntry}
          onSubmit={handleSubmit}
          onClose={resetModal}
        />
      )}
    </div>
  );
}