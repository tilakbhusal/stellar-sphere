# Psychrometric calculator

Route: `/psychrometric-calculator/`. The existing Astro layout, navigation, React integration, and GitHub Pages build are retained. No additional production dependency or backend is required.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run dev
```

The nine Node test groups cover 24 ASHRAE reference checkpoints, 1,044 property-pair cases, independent comparison, unit conversions, dry air, saturation, freezing, invalid input and conflicting measurements. Two of the pair cases correctly reject ambiguous wet-bulb/enthalpy combinations. The other 1,042 recover the original state.

Browser verification also passed on the production build: React hydration, SI/Imperial switching, all three single-property assumption modes, altitude unit conversion, invalid-input messages, keyboard point movement, point dragging, JSON download, and a 390 px mobile viewport without horizontal overflow. No browser JavaScript errors were observed.

## Engineering model

`src/lib/psychrometrics.js` owns the pure solver. Canonical units are °C, kPa, kg/kg dry air, kJ/kg dry air and RH percent. SH alone uses kg/kg **moist** air. A complete state has `Tdb, Twb, Tdp, RH, W, SH, Pv, Pws, h`.

ASHRAE Handbook—Fundamentals (2017), chapter 1, equations 5/6, 20–24, 30, 33/35 underpin the implementation. The saturation curve switches at the water triple point (0.01 °C); wet-bulb balances use liquid water at/above 0 °C and ice below. Dew/frost-point inversion and wet-bulb solutions are bracketed, bounded, iteration-limited calculations. The saturation range is −100 to 200 °C; complete states additionally require a feasible wet-bulb solution and dry-bulb below local boiling temperature. Fog/two-phase states are outside scope.

The altitude formula uses the specified lapse-rate atmosphere with an explicit −500 to 11,000 m domain. Blank altitude means 101.325 kPa. Standard atmosphere is not measured weather pressure. The solver API also accepts a supplied positive pressure in kPa.

At fixed pressure, **two independent properties** are essential. Single-property modes require an explicitly enabled, editable assumption or another supplied property. W, SH, Pv and Tdp all describe the same moisture degree of freedom, and Tdb/Pws describe the same temperature degree of freedom. They cannot alone close the state. The general solver reduces each independent pair to Tdb and W, scans for bracketed roots, tests alternative pairs, detects multiple roots and validates every supplied constraint. Inconsistent measurements are rejected rather than silently changed.

SI and Imperial displays preserve the same physical state. Temperature, pressure and humidity ratio convert to °F, psi and grains/lb dry air. SH converts to lb/lb moist air (numerically unchanged). **Enthalpy deliberately retains the SI 0 °C dry-air datum in both displays**, using BTU/lb = kJ/kg ÷ 2.326. Absolute values therefore differ from charts with the conventional IP enthalpy datum; the UI documents this choice.

For zero moisture, Tdp is null, not a fictitious finite temperature. It is also null for vapor pressure below the −100 °C curve limit. The UI explains both cases.

## Verification and Critique Mode

The independent checker is vendored PsychroLib 2.5.0 at upstream commit `3066345dc8cf91bf59134147cf917f982c1fce13`. Only its UMD export wrapper was replaced with an ESM default export. Copyright notices and the MIT license are preserved in `src/lib/vendor/`.

Reference checkpoints come from upstream `tests/test_psychrolib_si.py`: chapter 1 Tables 1–3 and Example 1. These are **secondary transcriptions of ASHRAE values**, not a licensed complete Handbook dataset. Saturation-pressure tolerance is 300 ppm except the rounded −60 °C value (0.01 Pa absolute). Humidity-ratio tolerances follow the upstream 0.5–1% limits. Pressure tolerance is 2 Pa to accommodate the stated fundamental-constant atmosphere rather than the rounded ASHRAE coefficients. Example 1 uses the upstream stated rounding tolerances.

Table checks run after a successful solve and show all actual, expected, tolerance and flag values. These are fixed equation regression checks, not interpolation of arbitrary user states into a sparse table. Any failed checkpoint caps the result score at 4 and flags it.

Critique Mode independently recomputes derived properties from the solved Tdb/W anchors using PsychroLib. Those two anchors are constrained by all known inputs during solving. The checker shares the ASHRAE model but uses a separate implementation; this is numerical consistency evidence, not independent experimental validation or ASHRAE certification. PsychroLib uses a small humidity floor; near-dry differences remain visible.

Score = max(0, 10 − 2 × maximum absolute error / property tolerance), rounded to 2 decimals. Acceptance threshold is 8. Tolerances: Tdb 0.002 °C; Twb/Tdp 0.003 °C; RH 0.01 percentage points; W/SH 2×10⁻⁷ kg/kg; Pv/Pws 2×10⁻⁵ kPa; h 0.002 kJ/kg. A failed audit triggers one recomputation with the independent implementation, subject to original measurement constraints and a wet-bulb balance check. Unresolved discrepancies remain flagged. Initial and final audits are retained in JSON exports.

## Interface

The React page supports preset and arbitrary known inputs, named units on all fields, unit/altitude conversion, JSON export and nine educational property explanations. Its SVG chart draws red dry-bulb lines, green humidity-ratio lines and blue RH curves, with optional enthalpy and wet-bulb overlays. Pressure and state determine chart bounds. The axes stay fixed during dragging. Clicks beyond saturation move to the saturation boundary and announce the adjustment. Keyboard arrows move the focused point; number fields provide a precise accessible alternative.

## Sources

- https://psychrometrics.github.io/psychrolib/api_docs.html
- https://github.com/psychrometrics/psychrolib/blob/3066345dc8cf91bf59134147cf917f982c1fce13/tests/test_psychrolib_si.py
- https://www.ashrae.org/technical-resources/ashrae-handbook

## Integration

Merge the feature branch or apply the supplied patch to the repository's main branch after review. The existing GitHub Pages workflow publishes main; the calculator is then available at `https://tilakbhusal.com/psychrometric-calculator/`. A local build alone does not publish the website.
