# Calculators directory

Navigation: **Calculators → calculator card → individual calculator page**.

The directory lives at `/calculators/`, uses the website's existing design, and works without JavaScript. Each card is a complete keyboard-accessible link. The navigation highlights Calculators on registered calculator pages; the psychrometric page includes an All calculators link.

## Add another calculator

1. Create the calculator's Astro page, for example `src/pages/pump-power-calculator.astro`, with its calculator implementation.
2. Add an entry to the `calculators` array in `src/data/calculators.ts`:

```ts
{
  title: "Pump Power Calculator",
  description: "Estimate pump power from flow, head, and efficiency.",
  href: "/pump-power-calculator",
  category: "Pumps & Motors",
  features: ["SI & Imperial", "Power estimation"],
},
```

3. Run `npm run build`, review the page, and publish through the existing GitHub Pages workflow.

The card appears automatically. Array order controls card order. Only register calculators whose pages are ready. Adding a card does not create the calculator implementation itself.

The existing `/psychrometric-calculator/` URL is preserved.
