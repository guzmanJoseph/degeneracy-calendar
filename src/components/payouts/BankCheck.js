import React from 'react';

export default function BankCheck({
  totalBuyins,
  totalCashouts,
  difference,
  balanced,
}) {
  return (
    <div
      className={`bank-check ${
        balanced ? 'balanced' : 'unbalanced'
      }`}
    >
      <div className="bank-numbers">
        <div>
          <span>Buy-ins</span>
          <strong>${totalBuyins.toFixed(2)}</strong>
        </div>

        <div>
          <span>Cash-outs</span>
          <strong>${totalCashouts.toFixed(2)}</strong>
        </div>

        <div>
          <span>Difference</span>
          <strong>
            ${Math.abs(difference).toFixed(2)}
          </strong>
        </div>
      </div>

      <p>
        {balanced
          ? '✓ Game balances perfectly'
          : `⚠ Game is off by $${Math.abs(
              difference
            ).toFixed(2)}`}
      </p>
    </div>
  );
}