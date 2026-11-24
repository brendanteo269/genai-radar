// Turn the fetched page into the same shape a feed item has.
const src = $('Check link').first().json;
const html = String($input.first().json.data || '');
const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
const text = html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
const snippet = (src.pasted ? src.pasted + ' ' : '') + text.slice(0, 3000);
if (snippet.trim().length < 80) throw new Error('Could not read that page. Paste the announcement text into the second box and try again.');
return [{ json: {
  title: (titleMatch ? titleMatch[1].trim() : src.host).slice(0, 200),
  link: src.link, snippet: snippet.slice(0, 3500), date: new Date().toISOString(), source: 'Submitted', feeds_failed: [],
} }];
