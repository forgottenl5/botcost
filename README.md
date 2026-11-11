# BotCost.dev

See which AI bots are crawling your site and what that bandwidth costs you, then generate ready-to-paste block rules.

Live: https://botcost.dev

## What it does

- Drop in a server log (Nginx, Apache, Cloudflare CSV or Vercel JSON, up to 50 MB).
- Matches requests against 19 known AI crawler fingerprints (GPTBot, ClaudeBot, CCBot, Bytespider and more), using user-agent tokens and, where published, IP ranges.
- Estimates bandwidth and compute cost for the period and projects it monthly and yearly.
- Generates block rules for Cloudflare WAF (Free and Pro), Nginx, Next.js middleware and robots.txt.

## Privacy

Log analysis runs entirely in your browser. The log file is read with the FileReader API and never sent anywhere. The only network request the app makes is the optional email sign-up, which sends just the email address.

## Project layout

| File | Purpose |
|---|---|
| `index.html` | Landing page |
| `analyze.html` | The analyzer: parser, bot database, cost model and rule generator in one file |
| `worker.js` | Cloudflare Worker that stores email sign-ups in D1 |
| `schema.sql` | D1 table for the sign-ups |
| `wrangler.toml.example` | Worker config template |
| `_redirects` | Cloudflare Pages routing |

## Run it yourself

The analyzer is static HTML with no build step. Open `analyze.html` in a browser, or host the folder on any static host.

For the optional email sign-up:

1. Create a D1 database and apply `schema.sql`.
2. Copy `wrangler.toml.example` to `wrangler.toml` and fill in your database ID and domain.
3. Deploy with `npx wrangler deploy`.

## Contributing

Bot fingerprints change often. Issues and pull requests that add or correct bots in the `BOTS` list in `analyze.html` are welcome; please include a link to the operator's published user agent or IP list.

## License

MIT
