import React from 'react';

export default function PastGames({ games }) {
  if (!games.length) return null;

  async function copyLink(game) {
    if (!game.share_code) return;

    const link =
      `${window.location.origin}/game/${game.share_code}`;

    try {
      await navigator.clipboard.writeText(link);
      alert('Share link copied!');
    } catch (error) {
      console.error('Copy error:', error);
    }
  }

  return (
    <div className="past-games">
      <div className="payout-section-title">
        <span>Past Games</span>
        <p>Your finalized games and share links</p>
      </div>

      {games.map((game) => (
        <div
          className="past-game-row"
          key={game.id}
        >
          <div className="past-game-info">
            <strong>{game.game_name}</strong>

            <span>
              {game.finalized_at
                ? new Date(
                    game.finalized_at
                  ).toLocaleDateString()
                : 'Finalized'}
            </span>
          </div>

          <button
            type="button"
            className="past-game-link-btn"
            onClick={() => copyLink(game)}
          >
            Copy Link
          </button>
        </div>
      ))}
    </div>
  );
}