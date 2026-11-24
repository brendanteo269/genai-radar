// Builds workflow.json (the file you import into n8n) from prompt.md and nodes/*.js.
// Run: node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const OWNER = 'brendanteo269';        // GitHub account that holds the cards
const REPO = 'genai-radar';           // repo the page is deployed from
const HOUR = 8;                       // daily run, local time

const code = (name) => readFileSync(new URL(`nodes/${name}.js`, import.meta.url), 'utf8');
const prompt = readFileSync(new URL('prompt.md', import.meta.url), 'utf8').trim();

let x = 0;
const node = (name, type, typeVersion, parameters, col, row, extra = {}) =>
  ({ id: `radar-${++x}`, name, type: `n8n-nodes-base.${type}`, typeVersion, position: [col * 240, row * 200], parameters, ...extra });
const js = (name, file, col, row, replace = (s) => s) =>
  node(name, 'code', 2, { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: replace(code(file)) }, col, row);
const repo = { authentication: 'accessToken', resource: 'file',
  owner: { __rl: true, mode: 'name', value: OWNER }, repository: { __rl: true, mode: 'name', value: REPO }, filePath: 'cards.json' };

const nodes = [
  node('Every morning', 'scheduleTrigger', 1.3, { rule: { interval: [{ field: 'days', daysInterval: 1, triggerAtHour: HOUR, triggerAtMinute: 0 }] } }, 0, 0),
  js('Feeds', 'feeds', 1, 0),
  node('Read feed', 'rssFeedRead', 1.2, { url: '={{ $json.url }}', options: {} }, 2, 0, { onError: 'continueRegularOutput' }),
  js('Keep recent', 'keep_recent', 3, 0),
  node('Get seen list', 'github', 1.1, { ...repo, operation: 'get', asBinaryProperty: false, additionalParameters: {} }, 4, 0, { executeOnce: true }),
  js('Skip seen', 'skip_seen', 5, 0),

  node('Grade one tool', 'formTrigger', 2.6, {
    authentication: 'none', formTitle: 'Grade one AI tool',
    formDescription: 'Paste a link to a new AI tool or feature. A card appears on the radar in about a minute.',
    formFields: { values: [
      { fieldLabel: 'Tool link', fieldName: 'link', fieldType: 'text', placeholder: 'https://', requiredField: true },
      { fieldLabel: 'Announcement text (optional)', fieldName: 'pasted', fieldType: 'textarea' },
    ] },
    responseMode: 'lastNode', options: { path: 'grade', buttonLabel: 'Grade it' },
  }, 1, 2, { webhookId: 'radar-grade-form' }),
  js('Check link', 'check_link', 2, 2),
  node('Fetch page', 'httpRequest', 4.2, { method: 'GET', url: '={{ $json.link }}',
    sendHeaders: true, headerParameters: { parameters: [{ name: 'User-Agent', value: 'Mozilla/5.0 (genai-radar)' }] },
    options: { timeout: 15000, response: { response: { responseFormat: 'text' } } } }, 3, 2, { onError: 'continueRegularOutput' }),
  js('Shape submission', 'shape_submission', 4, 2),

  js('Build request', 'build_request', 6, 1, (s) => s.replace('__PROMPT__', JSON.stringify(prompt))),
  node('Grade with Claude', 'httpRequest', 4.2, { method: 'POST', url: 'https://api.anthropic.com/v1/messages',
    authentication: 'predefinedCredentialType', nodeCredentialType: 'anthropicApi',
    sendHeaders: true, headerParameters: { parameters: [{ name: 'anthropic-version', value: '2023-06-01' }] },
    sendBody: true, specifyBody: 'json', jsonBody: '={{ JSON.stringify($json.body) }}',
    options: { timeout: 60000, batching: { batch: { batchSize: 1, batchInterval: 500 } } } }, 7, 1,
    { onError: 'continueRegularOutput', retryOnFail: true, maxTries: 2, waitBetweenTries: 3000 }),
  js('Make cards', 'make_cards', 8, 1),
  node('Get saved cards', 'github', 1.1, { ...repo, operation: 'get', asBinaryProperty: false, additionalParameters: {} }, 9, 1),
  js('Merge cards', 'merge_cards', 10, 1),
  node('Save cards', 'github', 1.1, { ...repo, operation: 'edit', binaryData: false,
    fileContent: '={{ $json.content }}', commitMessage: '={{ $json.message }}', additionalParameters: {} }, 11, 1),
];

const chain = (...names) => names.slice(0, -1).map((from, i) => [from, names[i + 1]]);
const links = [
  ...chain('Every morning', 'Feeds', 'Read feed', 'Keep recent', 'Get seen list', 'Skip seen', 'Build request'),
  ...chain('Grade one tool', 'Check link', 'Fetch page', 'Shape submission', 'Build request'),
  ...chain('Build request', 'Grade with Claude', 'Make cards', 'Get saved cards', 'Merge cards', 'Save cards'),
];
const connections = {};
for (const [from, to] of links) ((connections[from] ||= { main: [[]] }).main[0]).push({ node: to, type: 'main', index: 0 });

const names = new Set(nodes.map(n => n.name));
for (const [a, b] of links) if (!names.has(a) || !names.has(b)) throw new Error(`link to a missing box: ${a} -> ${b}`);

writeFileSync(new URL('workflow.json', import.meta.url),
  JSON.stringify({ name: 'GenAI Radar', nodes, connections, settings: { executionOrder: 'v1', timezone: 'Asia/Singapore' }, active: false }, null, 2) + '\n');
console.log(`workflow.json written: ${nodes.length} boxes, ${links.length} links`);
