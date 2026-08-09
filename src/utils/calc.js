export function fmt(n) {
  const num = Number(n || 0);
  const abs = Math.abs(num).toFixed(2);
  return (num >= 0 ? '+' : '-') + '$' + abs;
}

export function fmtPlain(n) {
  const num = Number(n || 0);
  return (num >= 0 ? '' : '-') + '$' + Math.abs(num).toFixed(2);
}

export function today() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(new Date());

  const values = {};

  for (const part of parts) {
    if (
      part.type === 'year' ||
      part.type === 'month' ||
      part.type === 'day'
    ) {
      values[part.type] = part.value;
    }
  }

  return `${values.year}-${values.month}-${values.day}`;
}

export function buildDailyMap(poker = []) {
  const map = {};

  poker.forEach((p) => {
    if (!p.date) return;
    map[p.date] = (map[p.date] || 0) + Number(p.pnl || 0);
  });

  return map;
}