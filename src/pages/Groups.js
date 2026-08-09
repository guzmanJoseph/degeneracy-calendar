import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { supabase } from '../supabaseClient';
import './Dashboard.css';

export default function Groups({ user }) {
  const [groupName, setGroupName] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');
  const [groups, setGroups] = useState([]);

  // --------------------------------
  // LOAD GROUPS
  // --------------------------------

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
      console.error('Load groups error:', error);
      return;
    }

    setGroups(data || []);
  }, [user?.id]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // --------------------------------
  // CREATE GROUP
  // --------------------------------

  async function createGroup() {
    const trimmedName = groupName.trim();

    if (!trimmedName) return;

    const { data: newGroup, error } = await supabase
      .from('groups')
      .insert({
        name: trimmedName,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Create group error:', error);
      alert(error.message);
      return;
    }

    const { error: memberError } = await supabase
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

  // --------------------------------
  // JOIN MANUALLY
  // --------------------------------

  async function joinGroup() {
    const groupId = joinGroupId.trim();

    if (!groupId) return;

    // Check if already a member
    const { data: existingMembership } =
      await supabase
        .from('group_members')
        .select('group_id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .maybeSingle();

    if (existingMembership) {
      alert('You are already in this group.');
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
      console.error('Join group error:', error);

      alert(
        'Could not join this group. Check the group code and try again.'
      );

      return;
    }

    setJoinGroupId('');

    await loadGroups();
  }

  // --------------------------------
  // COPY INVITE LINK
  // --------------------------------

  async function copyInviteLink(groupId) {
    const inviteLink =
      `${window.location.origin}/join/${groupId}`;

    try {
      await navigator.clipboard.writeText(
        inviteLink
      );

      alert('Group invite link copied!');
    } catch (error) {
      console.error(
        'Copy invite link error:',
        error
      );

      alert('Could not copy the invite link.');
    }
  }

  // --------------------------------
  // ENTER KEY SUPPORT
  // --------------------------------

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

  // --------------------------------
  // RENDER
  // --------------------------------

  return (
    <div className="page dashboard-page">
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

      {/* CREATE / JOIN */}

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
              setGroupName(e.target.value)
            }
            onKeyDown={handleCreateKeyDown}
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
              setJoinGroupId(e.target.value)
            }
            onKeyDown={handleJoinKeyDown}
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

      {/* MY GROUPS */}

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
            const group = item.groups;

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
                      {' · '}
                      {item.group_id.slice(
                        0,
                        8
                      )}
                      ...
                    </span>
                  </div>
                </div>

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

                  <span>Invite</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}