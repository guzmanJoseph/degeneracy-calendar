import React, { useState } from 'react';

export default function PlayerList({
  players,
  finalized,
  onEdit,
  onDelete,
}) {
  const [editingId, setEditingId] = useState(null);

  const [editName, setEditName] = useState('');
  const [editBuyin, setEditBuyin] = useState('');
  const [editCashout, setEditCashout] = useState('');

  function startEdit(player) {
    setEditingId(player.id);

    setEditName(player.name);
    setEditBuyin(player.buyin);
    setEditCashout(player.cashout);
  }

  function cancelEdit() {
    setEditingId(null);

    setEditName('');
    setEditBuyin('');
    setEditCashout('');
  }

  async function saveEdit(id) {
    const success = await onEdit(id, {
      name: editName,
      buyin: editBuyin,
      cashout: editCashout,
    });

    if (success) {
      cancelEdit();
    }
  }

  if (!players.length) return null;

  return (
    <div className="payout-section">
      <div className="payout-section-title">
        <span>Players</span>
        <p>{players.length} players entered</p>
      </div>

      {players.map((player) => {
        const editing = editingId === player.id;

        return (
          <div
            className="player-result-row"
            key={player.id}
          >
            {editing ? (
              <div className="player-edit-form">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) =>
                    setEditName(e.target.value)
                  }
                />

                <div className="player-edit-money">
                  <label>
                    Buy-in

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editBuyin}
                      onChange={(e) =>
                        setEditBuyin(e.target.value)
                      }
                    />
                  </label>

                  <label>
                    Cash-out

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editCashout}
                      onChange={(e) =>
                        setEditCashout(e.target.value)
                      }
                    />
                  </label>
                </div>

                <div className="player-edit-actions">
                  <button
                    type="button"
                    className="save-player-btn"
                    onClick={() =>
                      saveEdit(player.id)
                    }
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    className="cancel-player-btn"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <strong>{player.name}</strong>

                  <span>
                    ${Number(player.buyin).toFixed(2)} in · $
                    {Number(player.cashout).toFixed(2)} out
                  </span>
                </div>

                <div className="player-result-right">
                  <strong
                    className={
                      player.net > 0
                        ? 'pos'
                        : player.net < 0
                        ? 'neg'
                        : ''
                    }
                  >
                    {player.net >= 0 ? '+' : '-'}$
                    {Math.abs(player.net).toFixed(2)}
                  </strong>

                  {!finalized && (
                    <div className="player-row-actions">
                      <button
                        type="button"
                        className="edit-player-btn"
                        onClick={() =>
                          startEdit(player)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-player-btn"
                        onClick={() =>
                          onDelete(player.id)
                        }
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}