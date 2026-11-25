// Keep only fresh items: at most 7 days old, and the 5 newest per source.
// Also note which feeds gave nothing fresh (failed, or just quiet this week), so the page can say so.
// Matched on the start of host + path, first match wins, so one company's several blogs keep separate names (and separate caps).
const SOURCES = [
  ['openai.com', 'OpenAI'], ['blog.google', 'Google'], ['workspaceupdates.googleblog.com', 'Google Workspace'],
  ['microsoft.com/en-us/power-platform', 'Power Platform'], ['microsoft.com/en-us/microsoft-365', 'Microsoft 365'],
  ['microsoft.com/en-us/copilot', 'Microsoft 365'], ['blogs.microsoft.com', 'Microsoft'],
  ['theverge.com', 'The Verge'], ['zapier.com', 'Zapier'], ['news.sap.com', 'SAP'], ['salesforce.com', 'Salesforce'],
  ['about.fb.com', 'Meta'], ['mistral.ai', 'Mistral'],
];
const MAX_AGE_DAYS = 7, PER_SOURCE = 5;
// n8n's code box has no URL class, so the host is read with a pattern.
const sourceOf = (link) => {
  const m = /^https?:\/\/([^\/?#:@]+)([^?#]*)/i.exec(String(link));
  if (!m) return null;
  const at = m[1].toLowerCase().replace(/^www\./, '') + m[2];
  const hit = SOURCES.find(([prefix]) => at.startsWith(prefix));
  return hit ? hit[1] : m[1].toLowerCase().replace(/^www\./, '');
};
const strip = (s) => String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const now = Date.now(), bySource = {};
for (const { json: it } of $input.all()) {
  const source = it.link && sourceOf(it.link);
  if (!source || !it.title) continue;                       // a failed feed gives an item with no link
  const t = Date.parse(it.isoDate || it.pubDate || '');
  if (isNaN(t) || now - t > MAX_AGE_DAYS * 864e5 || t - now > 2 * 864e5) continue;   // too old, or a wrong date far in the future
  (bySource[source] ||= []).push({
    title: strip(it.title).slice(0, 200), link: it.link,
    snippet: strip(it.contentSnippet || it.content || it.summary).slice(0, 1500),
    date: new Date(t).toISOString(), source,
  });
}
const feeds_failed = [...new Set(SOURCES.map(s => s[1]))].filter(s => !bySource[s]);
return Object.values(bySource)
  .flatMap(list => list.sort((a, b) => b.date.localeCompare(a.date)).slice(0, PER_SOURCE))
  .map(json => ({ json: { ...json, feeds_failed } }));
