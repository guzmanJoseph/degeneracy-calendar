import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { supabase } from '../supabaseClient';
import './SharedGame.css';

export default function SharedGame({
  shareCode,
}) {
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // -------------------------
  // LOAD SHARED GAME
  // -------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadGame() {
      setLoading(true);
      setError('');

      const {
        data: gameData,
        error: gameError,
      } = await supabase
        .from('poker_games')
        .select('*')
        .eq('share_code', shareCode)
        .eq('status', 'finalized')
        .single();

      if (cancelled) return;

      if (gameError || !gameData) {
        console.error(
          'Shared game load error:',
          gameError
        );

        setError(
          'This game could not be found.'
        );

        setLoading(false);
        return;
      }

      const {
        data: playerData,
        error: playerError,
      } = await supabase
        .from('poker_game_players')
        .select('*')
        .eq('game_id', gameData.id);

      if (cancelled) return;

      if (playerError) {
        console.error(
          'Shared players load error:',
          playerError
        );

        setError(
          'Could not load the game results.'
        );

        setLoading(false);
        return;
      }

      setGame(gameData);
      setPlayers(playerData || []);
      setLoading(false);
    }

    if (shareCode) {
      loadGame();
    } else {
      setError(
        'This game could not be found.'
      );

      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [shareCode]);

  // -------------------------
  // LEADERBOARD
  // -------------------------

  const leaderboard = useMemo(() => {
    return players
      .map((player) => ({
        ...player,

        net:
          Number(player.cashout || 0) -
          Number(player.buyin || 0),
      }))
      .sort(
        (a, b) =>
          b.net - a.net
      );
  }, [players]);

  // -------------------------
  // LOADING
  // -------------------------

  if (loading) {
    return (
      <div className="shared-game-page">
        <div className="shared-loading">
          <img
            src="/stacked.png"
            alt="Stacked"
            className="shared-loading-logo"
          />

          <span>
            Loading game...
          </span>
        </div>
      </div>
    );
  }

  // -------------------------
  // ERROR
  // -------------------------

  if (error) {
    return (
      <div className="shared-game-page">
        <div className="shared-error">
          <img
            src="/stacked.png"
            alt="Stacked"
            className="shared-loading-logo"
          />

          <strong>
            Game unavailable
          </strong>

          <p>
            {error}
          </p>
        </div>
      </div>
    );
  }

  // -------------------------
  // PAGE
  // -------------------------

  return (
    <div className="shared-game-page">
      {/* STACKED HEADER */}

      <div className="shared-header">
        <img
          src="/stacked.png"
          alt="Stacked"
          className="shared-logo"
        />

        <span>
          Stacked
        </span>
      </div>

      {/* GAME SUMMARY */}

      <div className="shared-card">
        <span className="shared-label">
          Final Results
        </span>

        <h1>
          {game.game_name}
        </h1>

        <p>
          Bank Teller:{' '}
          {game.teller_name}
        </p>

        <div className="shared-code">
          Game {game.share_code}
        </div>
      </div>

      {/* FINAL STANDINGS */}

      <div className="shared-leaderboard">
        <div className="shared-section-title">
          Final Standings
        </div>

        {leaderboard.length === 0 ? (
          <div className="shared-no-results">
            No player results available.
          </div>
        ) : (
          leaderboard.map(
            (
              player,
              index
            ) => (
              <div
                className="shared-row"
                key={player.id}
              >
                <span className="shared-rank">
                  #{index + 1}
                </span>

                <strong>
                  {player.name}
                </strong>

                <strong
                  className={
                    player.net >= 0
                      ? 'shared-positive'
                      : 'shared-negative'
                  }
                >
                  {player.net >= 0
                    ? '+'
                    : '-'}
                  $
                  {Math.abs(
                    player.net
                  ).toFixed(2)}
                </strong>
              </div>
            )
          )
        )}
      </div>

      {/* FOOTER */}

      <div className="shared-footer">
        Tracked with Stacked
      </div>
    </div>
  );
}