# GenAI Radar: technical notes

How the radar is built, how to run it, and where it is weak. For what it is and why, read [README.md](README.md).

An n8n workflow reads announcement feeds, Claude fills in the same card for each item, and a static page shows the cards.

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

- **Feeds** (`nodes/feeds.js`): OpenAI, Google, Google Workspace updates, Microsoft 365, Microsoft Power Platform, Microsoft corporate blog, SAP News, Salesforce News, Meta Newsroom, Mistral, The Verge AI, Zapier.
- **Why these suppliers**: public sources report HEINEKEN uses Microsoft (Azure OpenAI, Copilot, Copilot Studio, Dynamics 365, Teams) and SAP (S/4HANA, Business Technology Platform and SAP Business AI behind the Hoppy chatbot). AWS, IBM, Collibra, Solace, Tricentis and Stravito also appear in vendor case studies, but they are infrastructure or publish no readable feed. Google Cloud and Salesforce appear only in a third-party listing.
- **Source names** (`nodes/keep_recent.js`): matched on the start of host + path, so Microsoft's three blogs stay separate and each gets its own 5-item cap.
- **Keep recent**: at most 7 days old, 5 newest per source.
- **Skip seen**: skips links that already have a card or were judged not relevant. The list lives in `cards.json`, so a failed grading is retried next run.
- **Grade with Claude**: `prompt.md`, model `claude-haiku-5-5`, one HTTP call per item. The reply must be JSON with a fixed set of fields, including `impact` (1 to 3: how big the change is). The page sizes each card by it.
- **Make cards**: drops replies that are not relevant, not JSON, or missing a field. Nothing incomplete is saved.
- **Save cards**: commits `cards.json` to GitHub; the page redeploys.

## Files

| File | What it is |
|---|---|
| `workflow.json` | Import this into n8n. Built by `build.mjs`; do not edit by hand |
| `nodes/*.js` | The code inside each n8n code box |
| `prompt.md` | The grading rules sent to Claude |
| `index.html` | The page. One file, no framework, no chart library. Text is written with `textContent` only, links must be http(s), and a content security policy limits network requests to the page's own site |
| `cards.json` | Written by the workflow |
| `check.mjs` | Self-check for the code boxes: `node check.mjs` |

## Setup

1. `npx n8n` in this folder, then open http://localhost:5678 and create the local owner account.
2. Open the **GenAI Radar** workflow (import `workflow.json` if it is not listed).
3. On **Grade with Claude**, add an Anthropic credential (your API key).
4. On **Get seen list**, **Get saved cards** and **Save cards**, add a GitHub credential: a fine-grained token limited to this repo with Contents read and write.
5. Press **Execute**, choose **From Every morning**, and check the commit and the cards. (`n8n execute` on the command line does not work here: it only starts workflows that have a manual trigger.)
6. Publish the workflow so the daily timer and the form are live. The form is at http://localhost:5678/form/grade.

After changing `prompt.md` or anything in `nodes/`: `node check.mjs && node build.mjs`, then re-import `workflow.json`.

## Design choices

- **The seen-list lives in `cards.json`**, not in n8n. A link is marked seen only after a clean answer, so a failed or unreadable grading is retried on the next run.
- **Nothing incomplete is saved.** A reply with a missing field, an unknown verdict or an API error is counted and dropped.
- **Dropped feeds stay dropped.** A feed that blocks automated readers is removed, not worked around.
- **Changing the workflow keeps credentials.** `build.mjs` writes `workflow.json` without credentials. To update a running n8n, export the live workflow (`npx n8n export:workflow --id=<id>`), replace the `jsCode` of the changed boxes, import it back (`npx n8n import:workflow`), then `npx n8n publish:workflow --id=<id>`. The running n8n picks up the published version without a restart.

## First real run (25 Nov 2026)

20 items graded: 2 cards, 16 judged not relevant, 2 unreadable replies (retried next run). A manual review of the 16 found 15 clearly not tools (news, developer infrastructure, talks, how-to guides) and 1 borderline. The fix was a better feed (Google Workspace release notes), not a looser prompt.

## Backfill (25 Nov 2026)

A one-off script pulled 225 items from the last 60 days of the feeds. They were graded by hand in Claude Code against `prompt.md`'s rules, not by the workflow: 16 became cards (marked `"model": "backfill-2026-11-25"`), and the other 209 were added to the seen list so the daily run skips them. Most rejects were customer stories, research, policy, partnerships and how-to guides.

## Known limits

- n8n runs on a laptop, so nothing updates while it is off.
- Auto-graded cards come from announcement text. Nobody used the tool.
- The page loads each source's icon from that source's own site. If one fails, a letter is shown.
- Cards graded before the `impact` score existed are sized from their verdict.
- n8n's code box has no `URL` class; links are checked with a pattern (`nodes/check_link.js`).
- TechCrunch and Product Hunt were dropped: one refuses automated readers, the other has no description to grade.
- The form fetches whatever public link it is given. Keep it on the laptop; do not expose it to the internet as is.
