import React, { useState } from 'react';

export default function AddPlayerForm({
  onAdd,
  finalized,
}) {
  const [playerName, setPlayerName] = useState('');
  const [buyin, setBuyin] = useState('');
  const [cashout, setCashout] = useState('');

  if (finalized) return null;

  async function handleSubmit(e) {
    e.preventDefault();

    const success = await onAdd({
      name: playerName,
      buyin,
      cashout,
    });

    if (success) {
      setPlayerName('');
      setBuyin('');
      setCashout('');
    }
  }

  return (
    <div className="payout-section">
      <div className="payout-section-title">
        <span>Add Player</span>
        <p>
          Enter their final buy-in and cash-out totals.
        </p>
      </div>

      <form
        className="add-player-card"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Player name"
          value={playerName}
          onChange={(e) =>
            setPlayerName(e.target.value)
          }
        />

        <div className="money-input-row">
          <label>
            Buy-in

            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={buyin}
              onChange={(e) =>
                setBuyin(e.target.value)
              }
            />
          </label>

          <label>
            Cash-out

            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={cashout}
              onChange={(e) =>
                setCashout(e.target.value)
              }
            />
          </label>
        </div>

        <button type="submit">
          Add Player
        </button>
      </form>
    </div>
  );
}