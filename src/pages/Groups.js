import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { supabase } from '../supabaseClient';
import './Dashboard.css';

export default function Groups({ user }) {
  const [groupName, setGroupName] =
    useState('');

  const [joinGroupId, setJoinGroupId] =
    useState('');

  const [groups, setGroups] =
    useState([]);

  const [groupProfitMap, setGroupProfitMap] =
    useState({});

  const [loadingProfits, setLoadingProfits] =
    useState(false);


  // =========================================
  // LOAD GROUPS
  // =========================================

  const loadGroups = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('group_members')
      .select(
        `
        group_id,
        role,
        groups (
          id,
          name,
          owner_id,
          created_at
        )
        `
      )
      .eq('user_id', user.id);

    if (error) {
      console.error(
        'Load groups error:',
        error
      );

      return;
    }

    setGroups(data || []);
  }, [user?.id]);


  useEffect(() => {
    loadGroups();
  }, [loadGroups]);


  // =========================================
  // LOAD PROFIT FOR EACH GROUP
  // =========================================

  useEffect(() => {
    if (!user?.id) return;

    if (groups.length === 0) {
      setGroupProfitMap({});
      return;
    }

    async function loadGroupProfits() {
      setLoadingProfits(true);

      const groupIds = groups.map(
        (item) => item.group_id
      );

      /*
        Only load THIS user's sessions
        that belong to one of their groups.
      */

      const { data, error } = await supabase
        .from('poker_sessions')
        .select(
          'group_id, pnl'
        )
        .eq(
          'user_id',
          user.id
        )
        .in(
          'group_id',
          groupIds
        );

      if (error) {
        console.error(
          'Load group profits error:',
          error
        );

        setLoadingProfits(false);

        return;
      }

      /*
        Build:

        {
          groupId1: 250,
          groupId2: -75,
          groupId3: 500
        }
      */

      const profitMap = {};

      groupIds.forEach((groupId) => {
        profitMap[groupId] = 0;
      });

      (data || []).forEach((session) => {
        if (!session.group_id) return;

        if (
          profitMap[session.group_id] ===
          undefined
        ) {
          profitMap[session.group_id] = 0;
        }

        profitMap[session.group_id] +=
          Number(session.pnl || 0);
      });

      setGroupProfitMap(profitMap);

      setLoadingProfits(false);
    }

    loadGroupProfits();
  }, [groups, user?.id]);


  // =========================================
  // CREATE GROUP
  // =========================================

  async function createGroup() {
    const trimmedName =
      groupName.trim();

    if (!trimmedName) return;

    const {
      data: newGroup,
      error,
    } = await supabase
      .from('groups')
      .insert({
        name: trimmedName,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error(
        'Create group error:',
        error
      );

      alert(error.message);

      return;
    }

    const {
      error: memberError,
    } = await supabase
      .from('group_members')
      .insert({
        group_id: newGroup.id,
        user_id: user.id,
        role: 'owner',
      });

    if (memberError) {
      console.error(
        'Create membership error:',
        memberError
      );

      alert(memberError.message);

      return;
    }

    setGroupName('');

    await loadGroups();
  }


  // =========================================
  // JOIN GROUP
  // =========================================

  async function joinGroup() {
    const groupId =
      joinGroupId.trim();

    if (!groupId) return;

    const {
      data: existingMembership,
    } = await supabase
      .from('group_members')
      .select('group_id')
      .eq(
        'group_id',
        groupId
      )
      .eq(
        'user_id',
        user.id
      )
      .maybeSingle();

    if (existingMembership) {
      alert(
        'You are already in this group.'
      );

      setJoinGroupId('');

      return;
    }

    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: user.id,
        role: 'member',
      });

    if (error) {
      console.error(
        'Join group error:',
        error
      );

      alert(
        'Could not join this group. Check the group code and try again.'
      );

      return;
    }

    setJoinGroupId('');

    await loadGroups();
  }


  // =========================================
  // COPY INVITE LINK
  // =========================================

  async function copyInviteLink(
    groupId
  ) {
    /*
      Use your public site instead of
      window.location.origin so this also
      works inside the Capacitor iPhone app.
    */

    const inviteLink =
      `https://stacked-poker.vercel.app/join/${groupId}`;

    try {
      await navigator.clipboard.writeText(
        inviteLink
      );

      alert(
        'Group invite link copied!'
      );
    } catch (error) {
      console.error(
        'Copy invite link error:',
        error
      );

      alert(
        'Could not copy the invite link.'
      );
    }
  }


  // =========================================
  // FORMAT PROFIT
  // =========================================

  function formatProfit(amount) {
    const value =
      Number(amount || 0);

    const sign =
      value > 0
        ? '+'
        : '';

    return `${sign}$${value.toFixed(2)}`;
  }


  // =========================================
  // ENTER KEY SUPPORT
  // =========================================

  function handleCreateKeyDown(e) {
    if (e.key === 'Enter') {
      createGroup();
    }
  }


  function handleJoinKeyDown(e) {
    if (e.key === 'Enter') {
      joinGroup();
    }
  }


  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="page">
      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1 className="page-title">
            Groups
          </h1>

          <p className="page-subtitle">
            Create a poker crew, invite friends,
            and compete together.
          </p>
        </div>
      </div>


      {/* =====================================
          CREATE / JOIN
      ===================================== */}

      <div className="group-action-grid">


        {/* CREATE GROUP */}

        <div className="group-action-card">
          <div className="group-action-header">
            <span className="stat-label">
              Create Group
            </span>

            <i
              className="ti ti-users-plus"
              aria-hidden="true"
            />
          </div>

          <input
            className="form-input"
            type="text"
            placeholder="e.g. Hard Rock Crew"
            value={groupName}
            onChange={(e) =>
              setGroupName(
                e.target.value
              )
            }
            onKeyDown={
              handleCreateKeyDown
            }
          />

          <button
            className="submit-btn"
            onClick={createGroup}
            type="button"
          >
            Create Group
          </button>
        </div>


        {/* JOIN GROUP */}

        <div className="group-action-card">
          <div className="group-action-header">
            <span className="stat-label">
              Join Group
            </span>

            <i
              className="ti ti-login"
              aria-hidden="true"
            />
          </div>

          <input
            className="form-input"
            type="text"
            placeholder="Paste group code"
            value={joinGroupId}
            onChange={(e) =>
              setJoinGroupId(
                e.target.value
              )
            }
            onKeyDown={
              handleJoinKeyDown
            }
          />

          <button
            className="submit-btn"
            onClick={joinGroup}
            type="button"
          >
            Join Group
          </button>
        </div>
      </div>


      {/* =====================================
          MY GROUPS
      ===================================== */}

      <div className="section-hdr">
        <span className="section-label">
          My Groups
        </span>

        <span className="group-count">
          {groups.length}
        </span>
      </div>


      {/* EMPTY */}

      {groups.length === 0 ? (
        <div className="empty-state">
          <i
            className="ti ti-users"
            aria-hidden="true"
          />

          <span>
            You are not in any groups yet.
          </span>
        </div>
      ) : (
        <div className="groups-list">
          {groups.map((item) => {
            const group =
              item.groups;

            const profit =
              groupProfitMap[
                item.group_id
              ] || 0;

            return (
              <div
                className="group-card"
                key={item.group_id}
              >
                <div className="group-card-main">
                  <div className="group-icon">
                    <i
                      className="ti ti-users"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="group-card-info">
                    <span className="group-name">
                      {group?.name ||
                        'Unnamed Group'}
                    </span>

                    <span className="group-meta">
                      {item.role === 'owner'
                        ? 'Owner'
                        : 'Member'}
                    </span>
                  </div>
                </div>


                {/* GROUP PROFIT */}

                <div className="group-card-right">
                  <span
                    className={`group-profit ${
                      profit > 0
                        ? 'positive'
                        : profit < 0
                        ? 'negative'
                        : ''
                    }`}
                  >
                    {loadingProfits
                      ? '...'
                      : formatProfit(
                          profit
                        )}
                  </span>

                  <span className="group-profit-label">
                    Your P&L
                  </span>
                </div>


                {/* INVITE */}

                <button
                  className="group-copy-btn"
                  type="button"
                  onClick={() =>
                    copyInviteLink(
                      item.group_id
                    )
                  }
                  title="Copy group invite link"
                >
                  <i
                    className="ti ti-link"
                    aria-hidden="true"
                  />

                  <span>
                    Invite
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}