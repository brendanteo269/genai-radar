// Add today's cards to the saved list. A card for a link we already have replaces the old one.
const run = $('Make cards').first().json;
const file = $input.first().json;
const old = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
const fresh = new Set(run.newCards.map(c => c.url));
const cards = [...run.newCards, ...(old.cards || []).filter(c => !fresh.has(c.url))]
  .sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 300);
const seen = [...new Set([...(old.seen || []), ...run.notRelevantLinks])].slice(-1000);   // links judged not relevant
const out = {
  updated: new Date().toISOString(),
  feeds_failed: run.fromForm ? (old.feeds_failed || []) : run.feeds_failed,   // a form run reads no feeds
  cards, seen,
};
return [{ json: {
  content: JSON.stringify(out, null, 2) + '\n', added: run.newCards.length, total: cards.length,
  message: `Radar: +${run.newCards.length} card(s), ${run.notRelevant} not relevant, ${run.malformed} unreadable`,
} }];
