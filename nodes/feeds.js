// The sources the radar reads each morning. Add or remove a line to change them.
// Checked 2026-11-24. Product Hunt was dropped: its feed carries no description to grade.
// TechCrunch was dropped: it refuses automated feed readers (403), and the radar does not work around a block. Anthropic publishes no RSS feed, so Claude news goes in through the form.
return [
  { url: 'https://openai.com/news/rss.xml' },
  { url: 'https://blog.google/technology/ai/rss/' },
  { url: 'https://www.microsoft.com/en-us/microsoft-365/blog/feed/' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' }, // covers Anthropic, Microsoft and others
  { url: 'https://www.zapier.com/blog/feeds/latest/' },                       // automation tools for non-engineers
  // Added 2026-11-25: product release notes. The first run showed news feeds are mostly not tools (16 of 20 rejected).
  { url: 'https://workspaceupdates.googleblog.com/feeds/posts/default' },
].map(json => ({ json }));
