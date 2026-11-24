// Build the message sent to Claude. The grading rules are the same for every item.
const SYSTEM = __PROMPT__;
const MODEL = 'claude-haiku-5-5';
return $input.all().map(({ json }) => ({ json: { ...json, model: MODEL, body: {
  model: MODEL, max_tokens: 700, system: SYSTEM,
  messages: [{ role: 'user', content:
    'Title: ' + json.title + '\nLink: ' + json.link + '\nSource: ' + json.source + '\nDescription: ' + (json.snippet || '(none given)') }],
} } }));
