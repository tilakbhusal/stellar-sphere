# Tilak Bhusal — portfolio

Astro 5 + Tailwind CSS v4 + MDX, with React islands for interactive charts.
Static output, no server required.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site into dist/
npm run preview  # serve the built site locally
```

Node 18.20+ or 20.3+ required.

## Before you deploy

1. **Set your domain.** Replace `https://tilakbhusal.com` in `astro.config.mjs`
   (powers canonical URLs and the sitemap) and in `public/robots.txt`.
2. **Check the email.** The site uses `tilak.bhusal56@gmail.com`, set in
   `src/data/site.ts`. The linked address inside the uploaded PDFs reads
   `bhusal.tilu@google.com`, which looks like a typo for `@gmail.com` — worth
   fixing in the source documents.

Deploy `dist/` to Netlify, Vercel, Cloudflare Pages, or GitHub Pages. No
adapter needed.

## Where the content lives

All page content is data, not markup. Edit these and every page updates:

| File | Holds |
| --- | --- |
| `src/data/site.ts` | Name, role, email, social links, nav, education |
| `src/data/experience.ts` | Work, research, certifications, awards, training, skills |
| `src/data/publications.ts` | Papers, work in progress, presentations, conferences |
| `src/data/projects.ts` | Project cards |
| `src/content/articles/*.mdx` | Blog posts |

`public/` holds the résumé and CV PDFs, the logo, and the favicon. Replacing
`Tilak-Bhusal-Resume.pdf` updates every download button.

### Bolding your name in author lists

`src/data/publications.ts` exports `SELF = "Bhusal, T."`. Any author string
matching it is rendered bold and in emerald. Keep author names formatted
exactly that way and it happens automatically.

## Writing articles

Drop a `.md` or `.mdx` file into `src/content/articles/`. Frontmatter:

```yaml
---
title: "Post title"
description: "One or two sentences — shown on the index card and in search results."
date: 2026-03-01
tags: ["Compressed air", "M&V"]
readingTime: 6      # optional
draft: false        # true hides it from the index and the build
---
```

The schema is enforced in `src/content.config.ts`, so a typo fails the build
rather than shipping quietly.

### Embedding an interactive chart

`src/components/charts/EnergyChart.jsx` is a themed recharts wrapper. Import it
at the top of an `.mdx` file and use `client:visible` so it hydrates on scroll:

```mdx
import EnergyChart from "../../components/charts/EnergyChart.jsx";

<EnergyChart
  client:visible
  type="line"                      {/* "line" | "bar" | "area" */}
  xKey="hour"
  unit="kW"
  yLabel="Demand (kW)"
  data={[
    { hour: "00:00", baseline: 210, retrofit: 105 },
    { hour: "12:00", baseline: 545, retrofit: 462 },
  ]}
  series={[
    { key: "baseline", name: "Baseline", dashed: true, color: "#4D7052" },
    { key: "retrofit", name: "After measures", color: "#0E7C4E" },
  ]}
/>
```

Other props: `height` (default 320), `stacked` (bar and area).

For a one-off visual that isn't a chart, write any React component into
`src/components/charts/` and import it the same way.

## Design notes

Palette, type scale, and the shared component classes live in
`src/styles/global.css` under `@theme`. Changing a token there changes it
everywhere.

| Token | Value | Used for |
| --- | --- | --- |
| `--color-sage` | `#A8D5BA` | Page background |
| `--color-forest` | `#2F5233` | All typography |
| `--color-emerald` | `#34D399` | Buttons and interactive highlights |
| `--color-emerald-deep` | `#0E7C4E` | Links, active nav, small accents |
| `--color-mist` | `#EDF6F0` | Panels behind dense text |

Emerald at `#34D399` doesn't carry enough contrast against sage for small text,
so it's reserved for filled buttons and larger marks; `--color-emerald-deep` is
the accessible variant used for links and labels.

The hero load-profile in `src/components/LoadProfile.astro` is the only animated
element on the site. It traces once on load and respects
`prefers-reduced-motion`.

## Adding a project case study

`src/data/projects.ts` supports an optional `metrics` array that renders as a
readout strip on the card. When a project grows into a full case study, drop a
chart component into the marked slot in `src/pages/projects.astro`, or write it
up as an article and link to it.
