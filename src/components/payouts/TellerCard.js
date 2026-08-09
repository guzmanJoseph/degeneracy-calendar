import React from 'react';

export default function TellerCard({
  game,
  finalized,
  allSettled,
}) {
  if (!game) return null;

  return (
    <div className="teller-card">
      <span>Bank Teller</span>

      <strong>{game.teller_name}</strong>

      <div
        className={`game-status ${
          finalized || allSettled ? 'done' : ''
        }`}
      >
        {finalized
          ? 'Finalized ✓'
          : allSettled
          ? 'Settled ✓'
          : 'Settlement Open'}
      </div>
    </div>
  );
}