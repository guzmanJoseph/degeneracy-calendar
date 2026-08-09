import React from 'react';

export default function FinalLeaderboard({
  finalized,
  game,
  leaderboard,
}) {
  if (!finalized || !game) return null;

  async function copyShareLink() {
    if (!game.share_code) return;

    const shareUrl =
        `${window.location.origin}/game/${game.share_code}`;

    try {
        await navigator.clipboard.writeText(
        shareUrl
        );

        alert('Share link copied!');
    } catch (error) {
        console.error('Copy error:', error);
    }
    }

  return (
    <>
      <div className="finalized-card">
        <div>
          <span className="finalized-label">
            Game Complete
          </span>

          <strong>Finalized ✓</strong>
        </div>

        <div className="share-code">
          {game.share_code}
        </div>
      </div>

      <button
        type="button"
        className="copy-share-btn"
        onClick={copyShareLink}
        >
        Copy Share Link
        </button>

      <div className="mini-leaderboard">
        <div className="payout-section-title">
          <span>Final Standings</span>
          <p>Results from this game</p>
        </div>

        {leaderboard.map((player, index) => (
          <div
            className="leaderboard-row"
            key={player.id}
          >
            <span className="leaderboard-rank">
              #{index + 1}
            </span>

            <strong className="leaderboard-name">
              {player.name}
            </strong>

            <strong
              className={`leaderboard-pnl ${
                player.net >= 0 ? 'pos' : 'neg'
              }`}
            >
              {player.net >= 0 ? '+' : '-'}$
              {Math.abs(player.net).toFixed(2)}
            </strong>
          </div>
        ))}
      </div>
    </>
  );
}