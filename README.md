# GenAI Radar

New AI tools, graded each morning for five kinds of staff at a brewer. An n8n workflow reads announcement feeds, Claude fills in the same card for each item, and a static page shows the cards. An independent project.

## How it works

```
every morning                         on demand
[Every morning]                       [Grade one tool]  (form)
[Feeds] -> [Read feed]                [Check link] -> [Fetch page]
[Keep recent]                         [Shape submission]
[Get seen list] -> [Skip seen]              |
            \______________________________/
                          |
     [Build request] -> [Grade with Claude] -> [Make cards]
     [Get saved cards] -> [Merge cards] -> [Save cards]
```

- **Feeds** (`nodes/feeds.js`): OpenAI, Google, Microsoft 365, The Verge AI, Zapier, Google Workspace updates.
- **Keep recent**: at most 7 days old, 5 newest per source.
- **Skip seen**: skips links that already have a card or were judged not relevant. The list lives in `cards.json`, so a failed grading is retried next run.
- **Grade with Claude**: `prompt.md`, model `claude-haiku-5-5`. The reply must be JSON with a fixed set of fields.
- **Make cards**: drops replies that are not relevant, not JSON, or missing a field. Nothing incomplete is saved.
- **Save cards**: commits `cards.json` to GitHub; the page redeploys.
- **Tested by me**: add your own notes to `tested.json`, keyed by the card's link. The page shows those cards first.

## Files

| File | What it is |
|---|---|
| `workflow.json` | Import this into n8n. Built by `build.mjs`; do not edit by hand |
| `nodes/*.js` | The code inside each n8n code box |
| `prompt.md` | The grading rules sent to Claude |
| `index.html` | The page. One file, no framework |
| `cards.json` | Written by the workflow |
| `tested.json` | Written by you |
| `check.mjs` | Self-check for the code boxes: `node check.mjs` |

## Setup

1. `npx n8n` in this folder, then open http://localhost:5678 and create the local owner account.
2. Open the **GenAI Radar** workflow (import `workflow.json` if it is not listed).
3. On **Grade with Claude**, add an Anthropic credential (your API key).
4. On **Get seen list**, **Get saved cards** and **Save cards**, add a GitHub credential: a fine-grained token limited to this repo with Contents read and write.
5. Press **Execute workflow** once and check the cards.
6. Publish the workflow so the daily timer and the form are live. The form is at http://localhost:5678/form/grade.

After changing `prompt.md` or anything in `nodes/`: `node check.mjs && node build.mjs`, then re-import `workflow.json`.

## Known limits

- n8n runs on a laptop, so nothing updates while it is off.
- Auto-graded cards come from announcement text. Nobody used the tool.
- n8n's code box has no `URL` class; links are checked with a pattern (`nodes/check_link.js`).
- TechCrunch and Product Hunt were dropped: one refuses automated readers, the other has no description to grade.
- The form fetches whatever public link it is given. Keep it on the laptop; do not expose it to the internet as is.
