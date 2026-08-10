import React, { useState } from 'react';

export default function PastGames({ games }) {
  const [copiedGameId, setCopiedGameId] =
    useState(null);

  if (!games.length) return null;

  function getShareLink(game) {
    if (!game.share_code) return '';

    return `https://stacked-poker.vercel.app/game/${game.share_code}`;
  }

  async function copyLink(game) {
    const link = getShareLink(game);

    if (!link) {
      alert('This game does not have a share link.');
      return;
    }

    try {
      await navigator.clipboard.writeText(link);

      setCopiedGameId(game.id);

      setTimeout(() => {
        setCopiedGameId(null);
      }, 1800);
    } catch (error) {
      console.error('Copy error:', error);

      /*
        Fallback for devices where the
        Clipboard API is unavailable.
      */

      const textarea =
        document.createElement('textarea');

      textarea.value = link;

      document.body.appendChild(textarea);

      textarea.select();

      document.execCommand('copy');

      document.body.removeChild(textarea);

      setCopiedGameId(game.id);

      setTimeout(() => {
        setCopiedGameId(null);
      }, 1800);
    }
  }

  async function shareGame(game) {
    const link = getShareLink(game);

    if (!link) return;

    /*
      On iPhone this opens the native
      iOS share sheet.
    */

    if (navigator.share) {
      try {
        await navigator.share({
          title: game.game_name || 'Stacked Poker Game',
          text: `Check out the results from ${
            game.game_name || 'our poker game'
          } on Stacked.`,
          url: link,
        });

        return;
      } catch (error) {
        /*
          AbortError just means the user
          closed the share sheet.
        */

        if (error?.name === 'AbortError') {
          return;
        }

        console.error(
          'Native share error:',
          error
        );
      }
    }

    /*
      Fall back to copying.
    */

    await copyLink(game);
  }

  return (
    <div className="past-games">
      <div className="past-games-header">
        <div>
          <span className="payout-label">
            History
          </span>

          <h2>Past Games</h2>

          <p>
            Your finalized games and share links.
          </p>
        </div>
      </div>

      <div className="past-games-list">
        {games.map((game) => {
          const shareLink =
            getShareLink(game);

          return (
            <div
              className="past-game-row"
              key={game.id}
            >
              <div className="past-game-info">
                <strong>
                  {game.game_name}
                </strong>

                <span>
                  {game.finalized_at
                    ? new Date(
                        game.finalized_at
                      ).toLocaleDateString()
                    : 'Finalized'}
                </span>
              </div>

              <div className="past-game-actions">
                <button
                  type="button"
                  className="past-game-view-btn"
                  disabled={!shareLink}
                  onClick={() => {
                    window.open(
                      shareLink,
                      '_blank',
                      'noopener,noreferrer'
                    );
                  }}
                >
                  <i
                    className="ti ti-external-link"
                    aria-hidden="true"
                  />

                  View
                </button>

                <button
                  type="button"
                  className="past-game-link-btn"
                  disabled={!shareLink}
                  onClick={() =>
                    copyLink(game)
                  }
                >
                  <i
                    className={
                      copiedGameId === game.id
                        ? 'ti ti-check'
                        : 'ti ti-copy'
                    }
                    aria-hidden="true"
                  />

                  {copiedGameId === game.id
                    ? 'Copied'
                    : 'Copy'}
                </button>

                <button
                  type="button"
                  className="past-game-share-btn"
                  disabled={!shareLink}
                  onClick={() =>
                    shareGame(game)
                  }
                >
                  <i
                    className="ti ti-share"
                    aria-hidden="true"
                  />

                  Share
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}