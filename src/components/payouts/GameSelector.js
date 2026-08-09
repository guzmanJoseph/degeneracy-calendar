import React from 'react';

export default function GameSelector({
  games,
  selectedGameId,
  onChange,
}) {
  if (!games.length) return null;

  return (
    <div className="game-selector">
      <label>
        Game

        <select
          value={selectedGameId || ''}
          onChange={(e) =>
            onChange(e.target.value)
          }
        >
          {games.map((game) => (
            <option
              key={game.id}
              value={game.id}
            >
              {game.game_name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}