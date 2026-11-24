// The form accepts any text. Only fetch real public web links.
// n8n's code box has no URL class, so the link is checked with a pattern.
const form = $input.first().json;
const link = String(form.link || form['Tool link'] || '').trim();
const m = /^https?:\/\/([^\/?#:@\s]+)(:\d+)?([\/?#]\S*)?$/i.exec(link);
if (!m) throw new Error('That is not a link. Paste the full address, starting with https://');
const host = m[1].toLowerCase();
const isPrivate = host === 'localhost' || !host.includes('.') || host.endsWith('.local') || host.endsWith('.internal') ||
  /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(host) || host.includes('[');
if (isPrivate) throw new Error('Only public web links can be graded.');
return [{ json: { link, host, pasted: String(form.pasted || form['Announcement text (optional)'] || '').slice(0, 3000) } }];
