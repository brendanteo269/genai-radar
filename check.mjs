// Self-check for the code inside the n8n boxes. Run: node check.mjs
// Each box's code runs in a sandbox with no URL class, like n8n's own code box.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

export function runBox(file, input = [], others = {}) {
  const code = readFileSync(new URL(`nodes/${file}.js`, import.meta.url), 'utf8').replace('__PROMPT__', JSON.stringify('PROMPT'));
  const wrap = (list) => list.map(json => ({ json }));
  const box = (list) => ({ all: () => wrap(list), first: () => wrap(list)[0] });
  const sandbox = { $input: box(input), $: (name) => box(others[name] || []), Buffer, Date, JSON, console };
  const out = vm.runInNewContext(`(function(){${code}\n})()`, sandbox);
  return JSON.parse(JSON.stringify(out)).map(i => i.json);   // plain objects, so assert can compare them
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const day = 864e5, iso = (ago) => new Date(Date.now() - ago).toISOString();

  // Keep recent: drops old items, caps at 5 per source, reports feeds that gave nothing.
  const feedItems = [
    ...Array.from({ length: 8 }, (_, i) => ({ title: `OpenAI ${i}`, link: `https://openai.com/news/${i}`, isoDate: iso(i * 3600e3), contentSnippet: '<b>hi</b> there' })),
    { title: 'Old Google', link: 'https://blog.google/old', isoDate: iso(30 * day) },
    { title: 'Fresh Google', link: 'https://blog.google/new', isoDate: iso(day) },
    { title: 'MS', link: 'https://www.microsoft.com/en-us/microsoft-365/blog/x', isoDate: iso(2 * day) },
    { title: 'Wrong year', link: 'https://blog.google/future', isoDate: new Date(Date.now() + 300 * day).toISOString() },
    { error: 'feed failed' },
  ];
  const kept = runBox('keep_recent', feedItems);
  assert.equal(kept.filter(k => k.source === 'OpenAI').length, 5, 'caps at 5 per source');
  assert.equal(kept[0].title, 'OpenAI 0', 'newest first');
  assert.deepEqual(kept.filter(k => k.source === 'Google').map(k => k.title), ['Fresh Google'], 'drops items older than 7 days or dated far in the future');
  assert.equal(kept.find(k => k.source === 'Microsoft 365').source, 'Microsoft 365', 'www. host maps to its source');
  assert.deepEqual(kept[0].feeds_failed, ['The Verge', 'Zapier', 'Google Workspace'], 'names the feeds that returned nothing fresh');
  assert.equal(kept[0].snippet, 'hi there', 'strips HTML');

  // Check link: public links pass; private, malformed and credential-carrying links are refused.
  const link = (v) => runBox('check_link', [{ link: v }])[0].link;
  assert.equal(link(' https://example.com/tool?a=1 '), 'https://example.com/tool?a=1');
  for (const bad of ['notalink', 'ftp://example.com', 'http://localhost:5678', 'http://127.0.0.1/x', 'http://192.168.1.4', 'http://10.0.0.1', 'https://user@10.0.0.1/', 'http://intranet/page', 'javascript:alert(1)'])
    assert.throws(() => link(bad), undefined, `refuses ${bad}`);

  // Make cards: only complete, relevant answers become cards. Nothing bad passes silently.
  const asked = ['a', 'b', 'c', 'd', 'e'].map(k => ({ link: `https://x.com/${k}`, title: k, source: 'OpenAI', date: iso(0), model: 'm', feeds_failed: [] }));
  const good = { relevant: true, title: 'T', what: 'W', audiences: ['Sales', 'Made up'], try_for: 'Do it', verdict: 'Try now', why: 'Y', catch: 'C', data_caution: 'D' };
  const reply = (text) => ({ content: [{ type: 'text', text }] });
  const [made] = runBox('make_cards', [
    reply(JSON.stringify(good)),
    reply('```json\n' + JSON.stringify(good) + '\n```'),
    reply('{"relevant": false, "reason": "funding news"}'),
    reply(JSON.stringify({ ...good, verdict: 'Amazing' })),
    { error: { message: '529 overloaded' } },
  ], { 'Build request': asked });
  assert.deepEqual(made.newCards.map(c => c.url), ['https://x.com/a', 'https://x.com/b'], 'plain and fenced JSON both parse');
  assert.deepEqual(made.newCards[0].audiences, ['Sales'], 'unknown audience names are dropped');
  assert.equal(made.notRelevant, 1);
  assert.equal(made.malformed, 2, 'a bad verdict and an API error are counted, not saved');

  assert.deepEqual(made.notRelevantLinks, ['https://x.com/c'], 'only a clean "not relevant" is marked seen; errors are retried');

  // Skip seen: links with a card, or already judged not relevant, are not graded again.
  const savedFile = { content: Buffer.from(JSON.stringify({ cards: [{ url: 'https://openai.com/news/0' }], seen: ['https://openai.com/news/1'] })).toString('base64') };
  const unseen = runBox('skip_seen', [savedFile], { 'Keep recent': kept });
  assert.equal(unseen.length, kept.length - 2);
  assert.ok(!unseen.some(u => /news\/[01]$/.test(u.link)), 'drops both kinds of seen link');

  // Merge cards: a re-graded link replaces its old card; other old cards stay.
  const old = { cards: [{ url: 'https://x.com/a', title: 'old a', date: iso(day) }, { url: 'https://x.com/z', title: 'z', date: iso(2 * day) }], feeds_failed: ['Google'] };
  const [merged] = runBox('merge_cards', [{ content: Buffer.from(JSON.stringify(old)).toString('base64') }], { 'Make cards': [made] });
  const saved = JSON.parse(merged.content);
  assert.deepEqual(saved.cards.map(c => c.title), ['T', 'T', 'z'], 'replaces the old card for the same link and keeps the rest');
  assert.equal(merged.added, 2);
  assert.deepEqual(saved.seen, ['https://x.com/c'], 'remembers links judged not relevant');

  console.log('All box checks passed.');
}
