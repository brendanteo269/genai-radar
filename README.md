# GenAI Radar

New AI tools come out every week. Most staff have no time to work out which ones matter for their job. The radar reads the announcements each morning and turns each real tool into one short card.

An independent project by Brendan Teo, built with HEINEKEN's Global GenAI Lab in mind. Not affiliated with HEINEKEN.

## What a card tells you

- What the tool does, in one sentence
- Who it is for: Brand & marketing, Sales, Supply chain & brewery, Finance, or Internal comms & HR
- One task to try with it
- A verdict: Try now, Watch, or Skip
- The catch, and what company data not to put in

## How far to trust a card

Every card is auto-graded: Claude read the announcement, and nobody used the tool. An announcement is written to impress, so a card can overrate a tool. Each card links to the original announcement so you can check.

## How it works

1. Every morning, an n8n workflow reads twelve announcement feeds: the big AI labs (OpenAI, Google, Meta, Mistral), the suppliers HEINEKEN is publicly reported to use (Microsoft, including Copilot Studio, and SAP), plus Salesforce, Zapier, Google Workspace and The Verge.
2. It skips anything it has already seen.
3. Claude grades each new item against the same rules. Most items are news, not tools, and are dropped.
4. The cards are saved and the page updates.

You can also paste a link into a form to grade one tool on demand.

To start the page with more than a few days of cards, the last two months of announcements were graded once, by hand, in Claude Code against the same rules. Those cards are marked `backfill-2026-11-25` in `cards.json`; every card since comes from the daily run.

## What the page shows

- Left: pick a source or an audience.
- Top: how many cards are new this week, how many are worth trying now, and how many cards there are in all.
- Below: the cards. A bigger change gets a bigger card. Click one for the detail.

## Where it is weak

- It runs on a laptop, so it stops when the laptop is off.
- Twelve feeds are a sample, not the whole market. Anthropic, Perplexity, Canva, Adobe and IBM publish no feed the radar can read; their news only arrives through The Verge or the form.
- It is not advice on what data is safe to share. Follow your company's policy.

## More

- [TECHNICAL.md](TECHNICAL.md): how it is built and how to run it.
- [GenAI_Radar_Brief.pdf](GenAI_Radar_Brief.pdf): a two-page brief, plain version first, technical version second.
