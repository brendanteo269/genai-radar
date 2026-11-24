// Drop items the radar has already dealt with: links that already have a card,
// and links Claude already judged not relevant. The list lives in cards.json,
// so an item is only marked seen after it was graded successfully.
const saved = JSON.parse(Buffer.from($input.first().json.content, 'base64').toString('utf8'));
const seen = new Set([...(saved.cards || []).map(c => c.url), ...(saved.seen || [])]);
return $('Keep recent').all().filter(i => !seen.has(i.json.link)).map(i => ({ json: i.json }));
