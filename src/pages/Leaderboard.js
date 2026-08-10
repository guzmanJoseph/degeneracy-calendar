import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import './Dashboard.css';

import { supabase } from '../supabaseClient';
import { fmt } from '../utils/calc';

export default function Leaderboard({ user }) {
  const [filter, setFilter] =
    useState('everyone');

  const [groups, setGroups] =
    useState([]);

  const [
    selectedGroupId,
    setSelectedGroupId,
  ] = useState(null);

  const [allSessions, setAllSessions] =
    useState([]);

  const [
    selectedGroupSessions,
    setSelectedGroupSessions,
  ] = useState([]);

  const [
    personalSessions,
    setPersonalSessions,
  ] = useState([]);

  const [profileMap, setProfileMap] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [
    groupLoading,
    setGroupLoading,
  ] = useState(false);


  /* =========================================
     LOAD MAIN DATA
  ========================================= */

  useEffect(() => {
    if (!user?.id) return;

    async function loadLeaderboardData() {
      setLoading(true);


      /* --------------------------------
         LOAD USER'S GROUPS
      -------------------------------- */

      const {
        data: memberships,
        error: membershipError,
      } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups (
            id,
            name
          )
        `)
        .eq(
          'user_id',
          user.id
        );

      if (membershipError) {
        console.error(
          'Group membership error:',
          membershipError
        );
      }

      const myGroups =
        (memberships || []).map(
          (membership) => ({
            id:
              membership.group_id,

            name:
              membership.groups?.name ||
              'Unnamed Group',
          })
        );

      setGroups(myGroups);

      if (
        myGroups.length > 0
      ) {
        setSelectedGroupId(
          (current) =>
            current ||
            myGroups[0].id
        );
      }


      /* --------------------------------
         LOAD ALL SESSIONS
      -------------------------------- */

      const {
        data: everyoneSessions,
        error: sessionError,
      } = await supabase
        .from('poker_sessions')
        .select('*');

      if (sessionError) {
        console.error(
          'Leaderboard session error:',
          sessionError
        );
      }

      const sessions =
        everyoneSessions || [];

      setAllSessions(sessions);


      /* --------------------------------
         LOAD PERSONAL NON-GROUP SESSIONS
      -------------------------------- */

      const {
        data: personal,
        error: personalError,
      } = await supabase
        .from('poker_sessions')
        .select('*')
        .eq(
          'user_id',
          user.id
        )
        .is(
          'group_id',
          null
        );

      if (personalError) {
        console.error(
          'Personal session error:',
          personalError
        );
      }

      setPersonalSessions(
        personal || []
      );


      /* --------------------------------
         LOAD PROFILES FOR GLOBAL DATA
      -------------------------------- */

      const userIds = [
        ...new Set(
          sessions
            .map(
              (session) =>
                session.user_id
            )
            .filter(Boolean)
        ),
      ];

      if (
        userIds.length > 0
      ) {
        const {
          data: profiles,
          error: profileError,
        } = await supabase
          .from('profiles')
          .select(
            'id, username, display_name'
          )
          .in(
            'id',
            userIds
          );

        if (profileError) {
          console.error(
            'Profile load error:',
            profileError
          );
        }

        const map = {};

        (profiles || []).forEach(
          (profile) => {
            map[profile.id] =
              profile;
          }
        );

        setProfileMap(map);
      }

      setLoading(false);
    }

    loadLeaderboardData();
  }, [user?.id]);


  /* =========================================
     LOAD SELECTED GROUP SESSIONS
  ========================================= */

  useEffect(() => {
    if (!selectedGroupId) {
      setSelectedGroupSessions([]);
      return;
    }

    async function loadSelectedGroup() {
      setGroupLoading(true);

      const {
        data: sessions,
        error,
      } = await supabase
        .from('poker_sessions')
        .select('*')
        .eq(
          'group_id',
          selectedGroupId
        );

      if (error) {
        console.error(
          'Group leaderboard error:',
          error
        );

        setSelectedGroupSessions(
          []
        );

        setGroupLoading(false);

        return;
      }

      const groupSessions =
        sessions || [];

      setSelectedGroupSessions(
        groupSessions
      );


      /* --------------------------------
         LOAD GROUP PLAYER PROFILES
      -------------------------------- */

      const groupUserIds = [
        ...new Set(
          groupSessions
            .map(
              (session) =>
                session.user_id
            )
            .filter(Boolean)
        ),
      ];

      if (
        groupUserIds.length > 0
      ) {
        const {
          data: profiles,
          error: profileError,
        } = await supabase
          .from('profiles')
          .select(
            'id, username, display_name'
          )
          .in(
            'id',
            groupUserIds
          );

        if (profileError) {
          console.error(
            'Group profile load error:',
            profileError
          );
        }

        if (profiles) {
          setProfileMap(
            (current) => {
              const next = {
                ...current,
              };

              profiles.forEach(
                (profile) => {
                  next[profile.id] =
                    profile;
                }
              );

              return next;
            }
          );
        }
      }

      setGroupLoading(false);
    }

    loadSelectedGroup();
  }, [selectedGroupId]);


  /* =========================================
     BUILD LEADERBOARD ROWS
  ========================================= */

  const rows = useMemo(() => {
    const sessions =
      filter === 'groups'
        ? selectedGroupSessions
        : allSessions;

    const map = {};

    sessions.forEach(
      (session) => {
        const userId =
          session.user_id;

        if (!userId) return;

        if (!map[userId]) {
          map[userId] = {
            user_id: userId,
            total_profit: 0,
            sessions: 0,
            hours: 0,
            biggest_win: 0,
          };
        }

        const pnl =
          Number(
            session.pnl || 0
          );

        const hours =
          Number(
            session.hours || 0
          );

        map[userId].total_profit +=
          pnl;

        map[userId].sessions += 1;

        map[userId].hours +=
          hours;

        if (
          pnl >
          map[userId].biggest_win
        ) {
          map[userId].biggest_win =
            pnl;
        }
      }
    );

    return Object.values(
      map
    ).sort(
      (a, b) =>
        b.total_profit -
        a.total_profit
    );
  }, [
    allSessions,
    selectedGroupSessions,
    filter,
  ]);


  /* =========================================
     PERSONAL STATS
  ========================================= */

  const personalStats =
    useMemo(() => {
      const totalProfit =
        personalSessions.reduce(
          (sum, session) =>
            sum +
            Number(
              session.pnl || 0
            ),
          0
        );

      const totalHours =
        personalSessions.reduce(
          (sum, session) =>
            sum +
            Number(
              session.hours || 0
            ),
          0
        );

      const wins =
        personalSessions.filter(
          (session) =>
            Number(
              session.pnl || 0
            ) > 0
        ).length;

      const biggestWin =
        personalSessions.reduce(
          (best, session) =>
            Math.max(
              best,
              Number(
                session.pnl || 0
              )
            ),
          0
        );

      const hourly =
        totalHours > 0
          ? totalProfit /
            totalHours
          : 0;

      const winRate =
        personalSessions.length > 0
          ? (
              wins /
              personalSessions.length
            ) *
            100
          : 0;

      return {
        totalProfit,
        totalHours,
        hourly,
        sessions:
          personalSessions.length,
        biggestWin,
        winRate,
      };
    }, [personalSessions]);


  /* =========================================
     DISPLAY NAME
  ========================================= */

  function getName(userId) {
    const profile =
      profileMap[userId];

    if (
      profile?.username
    ) {
      return profile.username;
    }

    if (
      profile?.display_name
    ) {
      return profile.display_name;
    }

    if (
      userId === user.id
    ) {
      return (
        user?.user_metadata
          ?.username ||
        user?.email
          ?.split('@')[0] ||
        'You'
      );
    }

    return 'Unknown player';
  }


  /* =========================================
     ROW SUBTEXT
  ========================================= */

  function getSubtext(row) {
    const hourly =
      row.hours > 0
        ? row.total_profit /
          row.hours
        : 0;

    return `${row.sessions} sessions · ${row.hours.toFixed(
      1
    )}h · ${fmt(hourly)}/hr`;
  }


  /* =========================================
     CURRENT GROUP
  ========================================= */

  const selectedGroup =
    groups.find(
      (group) =>
        group.id ===
        selectedGroupId
    );


  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="page">
      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1 className="page-title">
            Leaderboard
          </h1>

          <p className="page-subtitle">
            Compare performance across
            the app, your groups, or your
            personal sessions.
          </p>
        </div>
      </div>


      {/* =====================================
          MAIN FILTER
      ===================================== */}

      <div className="type-toggle">
        <button
          className={
            filter === 'everyone'
              ? 'active'
              : ''
          }
          onClick={() =>
            setFilter('everyone')
          }
          type="button"
        >
          <i
            className="ti ti-world"
            aria-hidden="true"
          />

          Everyone
        </button>

        <button
          className={
            filter === 'groups'
              ? 'active'
              : ''
          }
          onClick={() =>
            setFilter('groups')
          }
          type="button"
        >
          <i
            className="ti ti-users"
            aria-hidden="true"
          />

          My Groups
        </button>

        <button
          className={
            filter === 'personal'
              ? 'active'
              : ''
          }
          onClick={() =>
            setFilter('personal')
          }
          type="button"
        >
          <i
            className="ti ti-user"
            aria-hidden="true"
          />

          Personal
        </button>
      </div>


      {/* =====================================
          GROUP SELECTOR
      ===================================== */}

      {filter === 'groups' && (
        <>
          {groups.length === 0 ? (
            <div className="day-empty">
              You're not in any groups yet.
            </div>
          ) : (
            <div className="leaderboard-group-tabs">
              {groups.map(
                (group) => (
                  <button
                    key={group.id}
                    type="button"
                    className={`leaderboard-group-tab ${
                      selectedGroupId ===
                      group.id
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      setSelectedGroupId(
                        group.id
                      )
                    }
                  >
                    {group.name}
                  </button>
                )
              )}
            </div>
          )}
        </>
      )}


      {/* =====================================
          PERSONAL VIEW
      ===================================== */}

      {filter === 'personal' && (
        <>
          <div className="section-hdr">
            <span className="section-label">
              Personal Sessions
            </span>
          </div>

          {loading ? (
            <p className="day-empty">
              Loading personal stats...
            </p>
          ) : personalSessions.length ===
            0 ? (
            <p className="day-empty">
              No personal sessions yet.
            </p>
          ) : (
            <div className="personal-leaderboard-stats">
              <div className="personal-stat-card">
                <span>
                  Total P&amp;L
                </span>

                <strong
                  className={
                    personalStats
                      .totalProfit >= 0
                      ? 'pos'
                      : 'neg'
                  }
                >
                  {fmt(
                    personalStats
                      .totalProfit
                  )}
                </strong>
              </div>

              <div className="personal-stat-card">
                <span>
                  Sessions
                </span>

                <strong>
                  {
                    personalStats.sessions
                  }
                </strong>
              </div>

              <div className="personal-stat-card">
                <span>
                  Hours
                </span>

                <strong>
                  {personalStats.totalHours.toFixed(
                    1
                  )}
                </strong>
              </div>

              <div className="personal-stat-card">
                <span>
                  Hourly
                </span>

                <strong
                  className={
                    personalStats.hourly >=
                    0
                      ? 'pos'
                      : 'neg'
                  }
                >
                  {fmt(
                    personalStats.hourly
                  )}
                  /hr
                </strong>
              </div>

              <div className="personal-stat-card">
                <span>
                  Win Rate
                </span>

                <strong>
                  {personalStats.winRate.toFixed(
                    0
                  )}
                  %
                </strong>
              </div>

              <div className="personal-stat-card">
                <span>
                  Biggest Win
                </span>

                <strong className="pos">
                  {fmt(
                    personalStats
                      .biggestWin
                  )}
                </strong>
              </div>
            </div>
          )}
        </>
      )}


      {/* =====================================
          NORMAL LEADERBOARD
      ===================================== */}

      {filter !== 'personal' && (
        <>
          <div className="section-hdr">
            <span className="section-label">
              {filter === 'groups'
                ? selectedGroup
                  ? `${selectedGroup.name} Rankings`
                  : 'Group Rankings'
                : 'App Rankings'}
            </span>
          </div>

          {loading ||
          (filter === 'groups' &&
            groupLoading) ? (
            <p className="day-empty">
              Loading leaderboard...
            </p>
          ) : rows.length === 0 ? (
            <p className="day-empty">
              No leaderboard data yet.
            </p>
          ) : (
            rows.map(
              (row, index) => {
                const name =
                  getName(
                    row.user_id
                  );

                const isMe =
                  row.user_id ===
                  user.id;

                return (
                  <div
                    className={`entry-card ${
                      isMe
                        ? 'active'
                        : ''
                    }`}
                    key={row.user_id}
                  >
                    <div className="entry-left">
                      <span className="entry-name">
                        #{index + 1}{' '}
                        {name}

                        {isMe
                          ? ' (You)'
                          : ''}
                      </span>

                      <span className="entry-sub">
                        {getSubtext(
                          row
                        )}
                      </span>
                    </div>

                    <div className="entry-right">
                      <span
                        className={`entry-amount ${
                          row.total_profit >=
                          0
                            ? 'pos'
                            : 'neg'
                        }`}
                      >
                        {fmt(
                          row.total_profit
                        )}
                      </span>
                    </div>
                  </div>
                );
              }
            )
          )}
        </>
      )}
    </div>
  );
}