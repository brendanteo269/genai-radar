# GenAI Radar — scope

Written 2026-11-24 for the HEINEKEN GenAI Intern application. Target: a live link and a 3-minute demo by tonight.

## 1. What it is

**Simple:** a web page that updates itself. Each day it finds new AI tools, and for each one it writes a short card: what it does, who at a beer company would use it, and whether it is worth trying. Cards you tested yourself are marked as tested.

**Technical:** a scheduled n8n workflow reads RSS feeds, removes items it has seen, sends each new item to Claude with a fixed grading prompt that returns JSON, and commits the result to a `cards.json` file in a GitHub repo. A static page on Vercel reads that file and renders the cards. A second n8n entry point (a form) grades any single tool on demand, for live demos.

## 2. Why this fits HEINEKEN (public facts only)

- HEINEKEN opened its Global GenAI Lab in Singapore on 19 March 2025 with AI Singapore, aimed at growth, productivity and customer engagement.
- Public examples of its GenAI work: Hoppy (a chatbot that helps finance staff find standards and processes), AIDDA (recommends next actions to sales reps), and Copilot in internal communications.
- The lab has been described as building agentic systems.
- The internship ad asks the intern to test tools, judge usefulness "from an employee perspective", and turn that into content.

So the radar grades every tool for **five kinds of brewer staff**, not for "office workers" in general:

| Audience | Example of their work |
|---|---|
| Brand and marketing | Campaign copy, visuals, social posts |
| Sales (bars, restaurants, retailers) | Visit prep, order follow-up, account notes |
| Supply chain and brewery | Planning, maintenance logs, quality reports |
| Finance | Reports, standards look-up, reconciliations |
| Internal communications and HR | Announcements, training material, events |

**Limits:** no HEINEKEN logo, bottle, star or green brand styling. The page says "an independent project, not affiliated with HEINEKEN". Only public information is used.

## 3. How it works, step by step

```
            every morning                     on demand (demo)
                 |                                  |
        [1 Timer]                          [1b Form: paste a tool link]
                 |                                  |
        [2 Read feeds]                              |
                 |                                  |
        [3 Skip items already seen]                 |
                 \________________  _______________/
                                  \/
                        [4 Claude grades the item]
                                  |
                        [5 Save card to cards.json]
                                  |
                        [Web page shows the cards]
```

| Box | Simple | Technical |
|---|---|---|
| 1 Timer | An alarm clock that starts the flow each morning | n8n Schedule Trigger, daily |
| 1b Form | A box where you paste one tool's link and get a card | n8n Form Trigger; fetches the page text with an HTTP Request node |
| 2 Read feeds | Checks 3 or 4 news sources for new AI tools | n8n RSS Read nodes, merged into one list |
| 3 Skip seen | Ignores anything it has already made a card for | n8n Remove Duplicates across runs, keyed on the item link |
| 4 Grade | Claude fills in the same form for every tool | Anthropic API call (Haiku for cost), fixed prompt, JSON output checked against a schema; a bad reply is retried once, then skipped |
| 5 Save | Adds the card to the list the page reads | n8n GitHub node commits `cards.json`; Vercel redeploys on commit |
| Page | Shows cards, newest first, with filters by audience | One static HTML file with plain JavaScript, no framework |

Exact node names get confirmed against your n8n version when building. A feed that fails to load is dropped and listed on the page, not silently ignored.

## 4. What one card holds

| Field | Example |
|---|---|
| Tool and link | "Claude reads spreadsheets directly" + source link |
| What it does | One sentence, plain words |
| Best for | Finance; Sales |
| Try it for | "Ask questions about last week's sales sheet without formulas" |
| Verdict | Try now / Watch / Skip |
| Catch | "Check the totals yourself" |
| Data caution | "Do not paste customer or pricing data into a personal account" |
| Label | **Auto-graded** or **Tested by me** |
| If tested | What you tried, how long it took, what went wrong |

The label is the important design choice: a machine's opinion never passes as a tested one. Same idea as Kermillion's Checked label.

## 5. Build list

**Must have (today):**
1. The 5-box daily flow running in n8n on your laptop
2. The web page live on Vercel with at least 10 cards
3. 3 cards tested by you, with your own notes
4. The on-demand form (box 1b), because it is the demo
5. A "How this works and where it is weak" section on the page

**Should have (if time, about 1 hour):**
6. Audience filter buttons (the five groups above)
7. A weekly "top 3" short post drafted by Claude from that week's cards, which you edit before it shows. This matches "create internal content such as short posts".

**Later (not today):**
- Running on a server so it updates with the laptop off
- A "try it in 10 minutes" exercise on each tested card, as workshop material
- A Make version of the same flow
- Telegram or email digest

**Not building:** logins, comments, a database, search, any HEINEKEN branding.

## 6. Done when

- The link opens on a phone and shows 10 or more cards
- 3 cards say "Tested by me"
- The flow has run once on its timer without you touching it
- Pasting a new tool link into the form produces a card on the page in under 2 minutes
- You can explain each box, and the grading prompt, without notes

## 7. The 3-minute demo

| Time | What you show | What you say |
|---|---|---|
| 0:00 | The page on your phone | "This updates itself every morning with new AI tools, graded for five kinds of staff at a brewer." |
| 0:30 | One "Tested by me" card | "This one I tried myself. Here is what went wrong." |
| 1:00 | The n8n canvas, 5 boxes | "Timer, feeds, skip what it has seen, Claude grades, save." |
| 1:40 | Paste a tool the viewer names into the form | "Give me any AI tool." The card appears. |
| 2:30 | The "where it is weak" section | "Auto-graded cards are opinions from an announcement. That is why the label exists." |

Record this as a 90-second screen video too, in case the live flow fails during a call.

## 8. Time plan (about 4.5 hours)

| Who | Task | Time |
|---|---|---|
| Claude | Workflow file, grading prompt, web page | ~45 min |
| You | Start n8n (`npx n8n`), import the file, add your Claude key and GitHub token | ~20 min |
| Both | Run on real feeds; hand-check 10 cards; fix the prompt | ~1 hour |
| You | Test 3 tools and write the verdicts | ~1.5 hours |
| You | Deploy to Vercel, record the 90-second video | ~40 min |
| Both | Resume line and LinkedIn message update | ~15 min |

**You need:** Node (installed), a Claude API key, your GitHub and Vercel accounts.

## 9. Known weak points

1. **One day of data.** By tonight it has run once or twice. Say so.
2. **Auto-grading is shallow.** Claude reads an announcement, not the tool. Expect some overrated cards; the hand-check catches the worst.
3. **Laptop-bound.** No updates while the laptop is off.
4. **No readers.** Nobody has used it. Never imply staff anywhere rely on it.
5. **Cost unmeasured.** Likely a few cents a day on Haiku; measure the first run and put the real number on the page.

## 10. What you must be able to explain

- Why two labels exist, and what "Auto-graded" does not tell you
- How the flow avoids grading the same item twice
- What happens when Claude returns a malformed answer
- Why the page is a static file and not an app
- One card where Claude was wrong and how you caught it

## 11. After it is built

- Add to `LIBRARY.md` with real numbers (cards, feeds, cost per run)
- Resume line, to be worded from the real numbers
- One sentence in the LinkedIn message with the link

## Sources

- HEINEKEN newsroom, Global GenAI Lab launch: https://www.theheinekencompany.com/newsroom/heineken-launches-global-genai-lab-in-singapore/
- EDB, lab launch and agentic systems: https://www.edb.gov.sg/en/about-edb/media-releases-publications/heineken-launches-global-genai-lab-in-singapore.html
- Hoppy and AIDDA: https://www.vinetur.com/en/2025052888119/heineken-deploys-ai-to-streamline-global-operations-and-boost-employee-productivity.html
- Bernard Marr on HEINEKEN and generative AI: https://bernardmarr.com/how-heineken-is-brewing-success-with-generative-ai/
