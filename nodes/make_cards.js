// Read Claude's answers. Keep only well-formed, relevant cards; count the rest.
const AUDIENCES = ['Brand & marketing', 'Sales', 'Supply chain & brewery', 'Finance', 'Internal comms & HR'];
const VERDICTS = ['Try now', 'Watch', 'Skip'];
const asked = $('Build request').all();
const answers = $input.all();
const newCards = [], notRelevantLinks = []; let malformed = 0;

answers.forEach(({ json: res }, i) => {
  const src = asked[i].json;
  let a;
  try {
    const text = res.content.find(b => b.type === 'text').text;
    a = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
  } catch { malformed++; return; }                          // API error or a reply that is not JSON
  if (a.relevant !== true) { notRelevantLinks.push(src.link); return; }
  const audiences = (Array.isArray(a.audiences) ? a.audiences : []).filter(x => AUDIENCES.includes(x)).slice(0, 3);
  const text = (v, n) => typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : null;
  const card = {
    url: src.link, title: text(a.title, 120), what: text(a.what, 300), audiences,
    try_for: text(a.try_for, 250), verdict: a.verdict, why: text(a.why, 300),
    catch: text(a.catch, 300), data_caution: text(a.data_caution, 300),
    source: src.source, date: src.date, original_title: src.title,
    graded_at: new Date().toISOString(), model: src.model,
  };
  const complete = card.title && card.what && card.try_for && card.catch && audiences.length && VERDICTS.includes(card.verdict);
  if (!complete) { malformed++; return; }
  newCards.push(card);
});
// Unreadable answers are not marked seen, so they are tried again on the next run.
return [{ json: { newCards, notRelevantLinks, notRelevant: notRelevantLinks.length, malformed, feeds_failed: asked[0] ? asked[0].json.feeds_failed : [], fromForm: asked[0] && asked[0].json.source === 'Submitted' } }];
