import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import './SharedGame.css';

export default function SharedGame({ shareCode }) {
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGame();
  }, [shareCode]);

  async function loadGame() {
    setLoading(true);
    setError('');

    const { data: gameData, error: gameError } = await supabase
      .from('poker_games')
      .select('*')
      .eq('share_code', shareCode)
      .eq('status', 'finalized')
      .single();

    if (gameError || !gameData) {
      setError('This game could not be found.');
      setLoading(false);
      return;
    }

    const { data: playerData, error: playerError } = await supabase
      .from('poker_game_players')
      .select('*')
      .eq('game_id', gameData.id);

    if (playerError) {
      setError('Could not load the game results.');
      setLoading(false);
      return;
    }

    setGame(gameData);
    setPlayers(playerData || []);
    setLoading(false);
  }

  const leaderboard = useMemo(() => {
    return players
      .map((player) => ({
        ...player,
        net:
          Number(player.cashout || 0) -
          Number(player.buyin || 0),
      }))
      .sort((a, b) => b.net - a.net);
  }, [players]);

  if (loading) {
    return (
      <div className="shared-game-page">
        <p>Loading game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-game-page">
        <div className="shared-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="shared-game-page">
      <div className="shared-header">
        <img
          src="/stacked.png"
          alt="Stacked"
          className="shared-logo"
        />

        <span>Stacked</span>
      </div>

      <div className="shared-card">
        <span className="shared-label">
          Final Results
        </span>

        <h1>{game.game_name}</h1>

        <p>
          Bank Teller: {game.teller_name}
        </p>

        <div className="shared-code">
          Game {game.share_code}
        </div>
      </div>

      <div className="shared-leaderboard">
        <div className="shared-section-title">
          Final Standings
        </div>

        {leaderboard.map((player, index) => (
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
              {player.net >= 0 ? '+' : '-'}$
              {Math.abs(player.net).toFixed(2)}
            </strong>
          </div>
        ))}
      </div>

      <div className="shared-footer">
        Tracked with Stacked
      </div>
    </div>
  );
}