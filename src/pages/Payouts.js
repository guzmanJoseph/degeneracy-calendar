import React, { useState } from 'react';
import './Payouts.css';

import { usePayoutGame } from '../hooks/usePayoutGame';

import PastGames from '../components/payouts/PastGames';
import CreateGameForm from '../components/payouts/CreateGameForm';
import GameSelector from '../components/payouts/GameSelector';
import TellerCard from '../components/payouts/TellerCard';
import AddPlayerForm from '../components/payouts/AddPlayerForm';
import PlayerList from '../components/payouts/PlayerList';
import BankCheck from '../components/payouts/BankCheck';
import SettlementSection from '../components/payouts/SettlementSection';

export default function Payouts({ user }) {
  const [creatingGame, setCreatingGame] = useState(false);

  const {
    openGames,
    finalizedGames,

    selectedGameId,
    setSelectedGameId,

    selectedGame,
    finalized,

    calculatedPlayers,

    winners,
    losers,

    totalBuyins,
    totalCashouts,
    difference,
    balanced,
    allSettled,

    createGame,
    addPlayer,
    editPlayer,
    deletePlayer,
    toggleSettled,
    finalizeGame,
  } = usePayoutGame(user);

  async function handleCreateGame(values) {
    const success = await createGame(values);

    if (success) {
      setCreatingGame(false);
    }

    return success;
  }

  return (
    <div className="page payouts-page">
      {/* HEADER */}

      <div className="payout-top">
        <div>
          <span className="payout-label">
            Poker Settlement
          </span>

          <h1>Payouts</h1>
        </div>

        <button
          className="new-game-btn"
          type="button"
          onClick={() =>
            setCreatingGame((prev) => !prev)
          }
        >
          {creatingGame ? 'Cancel' : '+ New Game'}
        </button>
      </div>

      {/* CREATE GAME */}

      <CreateGameForm
        open={creatingGame}
        onCreate={handleCreateGame}
      />

      {/* OPEN GAME SELECTOR */}

      <GameSelector
        games={openGames}
        selectedGameId={selectedGameId}
        onChange={setSelectedGameId}
      />

      {/* ACTIVE SETTLEMENT */}

      {selectedGame ? (
        <>
          <TellerCard
            game={selectedGame}
            finalized={finalized}
            allSettled={allSettled}
          />

          <AddPlayerForm
            onAdd={addPlayer}
            finalized={finalized}
          />

          <PlayerList
            players={calculatedPlayers}
            finalized={finalized}
            onEdit={editPlayer}
            onDelete={deletePlayer}
          />

          <BankCheck
            totalBuyins={totalBuyins}
            totalCashouts={totalCashouts}
            difference={difference}
            balanced={balanced}
          />

          <SettlementSection
            winners={winners}
            losers={losers}
            teller={selectedGame.teller_name}
            balanced={balanced}
            onToggleSettled={toggleSettled}
          />

          {!finalized && (
            <button
              className="finalize-game-btn"
              type="button"
              disabled={
                !balanced ||
                calculatedPlayers.length < 2
              }
              onClick={finalizeGame}
            >
              Finalize Game
            </button>
          )}
        </>
      ) : (
        <div className="payout-empty">
          No active settlement. Start a new game when
          you're ready.
        </div>
      )}

      {/* FINALIZED GAMES
          IMPORTANT: this stays OUTSIDE selectedGame
          so it remains visible after a game is finalized.
      */}

      <PastGames games={finalizedGames} />
    </div>
  );
}