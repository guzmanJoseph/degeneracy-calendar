import React from 'react';

export default function SettlementRow({
  player,
  type,
  teller,
  onToggle,
}) {
  return (
    <div
      className={`payout-row ${
        player.settled ? 'paid' : ''
      }`}
    >
      <div className="payout-person">
        <div
          className={`payout-dot ${
            type === 'collect' ? 'red' : 'green'
          }`}
        />

        <div>
          <strong>{player.name}</strong>

          <span>
            {type === 'collect'
              ? `${player.name} → ${teller}`
              : `${teller} → ${player.name}`}
          </span>
        </div>
      </div>

      <div className="payout-right">
        <strong
          className={
            type === 'collect'
              ? 'amount-red'
              : 'amount-green'
          }
        >
          ${Math.abs(player.net).toFixed(2)}
        </strong>

        <button
          type="button"
          className={`paid-button ${
            player.settled ? 'active' : ''
          }`}
          onClick={() => onToggle(player)}
        >
          {player.settled
            ? 'Settled ✓'
            : 'Mark Settled'}
        </button>
      </div>
    </div>
  );
}