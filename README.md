# GenAI Radar

New AI tools come out every week. Most staff have no time to work out which ones matter for their job. The radar reads the announcements each morning and turns each real tool into one short card.

An independent project by Brendan Teo, built with HEINEKEN's Global GenAI Lab in mind. Not affiliated with HEINEKEN.

## What a card tells you

- What the tool does, in one sentence
- Who it is for: Brand & marketing, Sales, Supply chain & brewery, Finance, or Internal comms & HR
- One task to try with it
- A verdict: Try now, Watch, or Skip
- The catch, and what company data not to put in

## Two kinds of card

- **Auto-graded.** Claude read the announcement. Nobody used the tool.
- **Tested.** I tried the tool myself and wrote what worked and what went wrong.

The page keeps these apart on purpose. An announcement is written to impress, so a card based only on it can overrate a tool.

## How it works

1. Every morning, an n8n workflow reads six announcement feeds.
2. It skips anything it has already seen.
3. Claude grades each new item against the same rules. Most items are news, not tools, and are dropped.
4. The cards are saved and the page updates.

You can also paste a link into a form to grade one tool on demand.

## What the page shows

- Left: pick a source or an audience.
- Top: how many cards are new this week, how many are worth trying now, and how many I tested.
- Below: the cards. A bigger change gets a bigger card. Click one for the detail.

## Where it is weak

- It runs on a laptop, so it stops when the laptop is off.
- Six feeds are a sample, not the whole market.
- It is not advice on what data is safe to share. Follow your company's policy.

## More

- [TECHNICAL.md](TECHNICAL.md): how it is built and how to run it.
