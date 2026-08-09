import React, { useState } from 'react';

export default function CreateGameForm({
  open,
  onCreate,
}) {
  const [gameName, setGameName] = useState('');
  const [tellerName, setTellerName] = useState('');

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();

    const success = await onCreate({
      gameName,
      tellerName,
    });

    if (success) {
      setGameName('');
      setTellerName('');
    }
  }

  return (
    <form
      className="create-game-card"
      onSubmit={handleSubmit}
    >
      <label>
        Game Name

        <input
          type="text"
          placeholder="Friday Night Poker"
          value={gameName}
          onChange={(e) =>
            setGameName(e.target.value)
          }
        />
      </label>

      <label>
        Bank Teller

        <input
          type="text"
          placeholder="Michael"
          value={tellerName}
          onChange={(e) =>
            setTellerName(e.target.value)
          }
        />
      </label>

      <button type="submit">
        Create Game
      </button>
    </form>
  );
}