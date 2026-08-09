import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';

export function usePayoutGame(user) {
  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [players, setPlayers] = useState([]);

  const selectedGame = games.find(
    (game) => game.id === selectedGameId
  );

  const openGames = games.filter(
    (game) => game.status !== 'finalized'
  );

  const finalizedGames = games.filter(
    (game) => game.status === 'finalized'
  );

  const finalized =
    selectedGame?.status === 'finalized';

  // -------------------------
  // LOAD GAMES
  // -------------------------

  useEffect(() => {
    if (!user?.id) return;

    async function loadGames() {
      const { data, error } = await supabase
        .from('poker_games')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Game load error:', error);
        return;
      }

      setGames(data || []);

      const firstOpenGame = data?.find(
        (game) => game.status !== 'finalized'
      );

      if (firstOpenGame) {
        setSelectedGameId((current) =>
          current || firstOpenGame.id
        );
      }
    }

    loadGames();
  }, [user?.id]);

  // -------------------------
  // LOAD PLAYERS
  // -------------------------

  useEffect(() => {
    if (!selectedGameId) {
      setPlayers([]);
      return;
    }

    async function loadPlayers() {
      const { data, error } = await supabase
        .from('poker_game_players')
        .select('*')
        .eq('game_id', selectedGameId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Player load error:', error);
        return;
      }

      setPlayers(data || []);
    }

    loadPlayers();
  }, [selectedGameId]);

  // -------------------------
  // CREATE GAME
  // -------------------------

  async function createGame({
    gameName,
    tellerName,
  }) {
    if (!gameName.trim() || !tellerName.trim()) {
      return false;
    }

    const { data, error } = await supabase
      .from('poker_games')
      .insert({
        created_by: user.id,
        game_name: gameName.trim(),
        teller_name: tellerName.trim(),
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('Create game error:', error);
      alert(error.message);
      return false;
    }

    setGames((prev) => [data, ...prev]);
    setSelectedGameId(data.id);

    return true;
  }

  // -------------------------
  // ADD PLAYER
  // -------------------------

  async function addPlayer({
    name,
    buyin,
    cashout,
  }) {
    if (
      finalized ||
      !selectedGameId ||
      !name.trim()
    ) {
      return false;
    }

    const buyinNumber = Number(buyin);
    const cashoutNumber = Number(cashout);

    if (
      Number.isNaN(buyinNumber) ||
      Number.isNaN(cashoutNumber)
    ) {
      return false;
    }

    const { data, error } = await supabase
      .from('poker_game_players')
      .insert({
        game_id: selectedGameId,
        name: name.trim(),
        buyin: buyinNumber,
        cashout: cashoutNumber,
        settled: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Add player error:', error);
      alert(error.message);
      return false;
    }

    setPlayers((prev) => [...prev, data]);

    return true;
  }

  // -------------------------
  // EDIT PLAYER
  // -------------------------

  async function editPlayer(id, updates) {
    if (finalized) return false;

    const buyinNumber = Number(updates.buyin);
    const cashoutNumber = Number(updates.cashout);

    if (
      Number.isNaN(buyinNumber) ||
      Number.isNaN(cashoutNumber)
    ) {
      return false;
    }

    const { data, error } = await supabase
      .from('poker_game_players')
      .update({
        name: updates.name.trim(),
        buyin: buyinNumber,
        cashout: cashoutNumber,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Edit player error:', error);
      alert(error.message);
      return false;
    }

    setPlayers((prev) =>
      prev.map((player) =>
        player.id === id ? data : player
      )
    );

    return true;
  }

  // -------------------------
  // DELETE PLAYER
  // -------------------------

  async function deletePlayer(id) {
    if (finalized) return;

    const { error } = await supabase
      .from('poker_game_players')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    setPlayers((prev) =>
      prev.filter((player) => player.id !== id)
    );
  }

  // -------------------------
  // TOGGLE SETTLED
  // -------------------------

  async function toggleSettled(player) {
    const newValue = !player.settled;

    const { error } = await supabase
      .from('poker_game_players')
      .update({
        settled: newValue,
      })
      .eq('id', player.id);

    if (error) {
      alert(error.message);
      return;
    }

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === player.id
          ? { ...p, settled: newValue }
          : p
      )
    );
  }

  // -------------------------
  // CALCULATIONS
  // -------------------------

  const calculatedPlayers = useMemo(() => {
    return players.map((player) => ({
      ...player,
      net:
        Number(player.cashout || 0) -
        Number(player.buyin || 0),
    }));
  }, [players]);

  const winners = calculatedPlayers.filter(
    (player) => player.net > 0
  );

  const losers = calculatedPlayers.filter(
    (player) => player.net < 0
  );

  const leaderboard = [...calculatedPlayers].sort(
    (a, b) => b.net - a.net
  );

  const totalBuyins = calculatedPlayers.reduce(
    (sum, player) =>
      sum + Number(player.buyin || 0),
    0
  );

  const totalCashouts = calculatedPlayers.reduce(
    (sum, player) =>
      sum + Number(player.cashout || 0),
    0
  );

  const difference =
    totalCashouts - totalBuyins;

  const balanced =
    Math.abs(difference) < 0.01;

  const allSettled =
    calculatedPlayers.length > 0 &&
    calculatedPlayers.every(
      (player) =>
        player.net === 0 || player.settled
    );

  // -------------------------
  // SHARE CODE
  // -------------------------

  function generateShareCode() {
    return Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
  }

  // -------------------------
  // FINALIZE GAME
  // -------------------------

  async function finalizeGame() {
    if (!selectedGame) return false;

    if (!balanced) {
      alert(
        `The game is off by $${Math.abs(
          difference
        ).toFixed(2)}. Fix the totals before finalizing.`
      );

      return false;
    }

    if (players.length < 2) {
      alert(
        'Add at least two players before finalizing.'
      );

      return false;
    }

    const shareCode =
      selectedGame.share_code ||
      generateShareCode();

    const { data, error } = await supabase
      .from('poker_games')
      .update({
        status: 'finalized',
        share_code: shareCode,
        finalized_at:
          new Date().toISOString(),
      })
      .eq('id', selectedGame.id)
      .select()
      .single();

    if (error) {
      console.error('Finalize error:', error);
      alert(error.message);
      return false;
    }

    setGames((prev) =>
      prev.map((game) =>
        game.id === data.id ? data : game
      )
    );

    setSelectedGameId(null);
    setPlayers([]);

    return true;
  }

  return {
    games,
    openGames,
    finalizedGames,

    selectedGameId,
    setSelectedGameId,

    selectedGame,
    finalized,

    calculatedPlayers,

    winners,
    losers,
    leaderboard,

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
  };
}