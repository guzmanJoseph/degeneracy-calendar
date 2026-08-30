const KEY = 'bankroll_tracker_v1';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
    // First run — seed with examples
    localStorage.setItem(KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  } catch {
    return { bets: [], poker: [] };
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}
