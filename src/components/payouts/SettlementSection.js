import React from 'react';
import SettlementRow from './SettlementRow';

export default function SettlementSection({
  winners,
  losers,
  teller,
  balanced,
  onToggleSettled,
}) {
  if (!balanced) return null;

  if (!winners.length && !losers.length) {
    return null;
  }

  return (
    <>
      <div className="payout-section">
        <div className="payout-section-title">
          <span>Collect</span>
          <p>Money players owe the bank</p>
        </div>

        {losers.length === 0 ? (
          <div className="payout-empty">
            Nothing to collect.
          </div>
        ) : (
          losers.map((player) => (
            <SettlementRow
              key={player.id}
              player={player}
              type="collect"
              teller={teller}
              onToggle={onToggleSettled}
            />
          ))
        )}
      </div>

      <div className="payout-section">
        <div className="payout-section-title">
          <span>Pay Out</span>
          <p>Money the bank owes players</p>
        </div>

        {winners.length === 0 ? (
          <div className="payout-empty">
            Nothing to pay out.
          </div>
        ) : (
          winners.map((player) => (
            <SettlementRow
              key={player.id}
              player={player}
              type="payout"
              teller={teller}
              onToggle={onToggleSettled}
            />
          ))
        )}
      </div>
    </>
  );
}