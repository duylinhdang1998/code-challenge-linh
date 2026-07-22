# Problem 2 — Fancy Form (Currency Swap)

A polished, production-quality token swap form built with **Vite + React 18 + TypeScript**.
(Vite is used per the challenge's bonus.)

## Running locally

```bash
npm install && npm run dev
```

Then open **http://localhost:5173** (Vite picks the next free port if 5173 is busy).
`pnpm` / `yarn` / `bun` work too.

```bash
npm run build     # type-check (tsc --noEmit) + production bundle (vite build)
npm run preview   # serve the production build locally
npm run lint      # type-check only
```

## Features

- **Live token prices** from `interview.switcheo.com/prices.json` — de-duplicated (keeps the most recent quote per currency), tokens without a positive price are dropped, leaving ~32 tradable tokens.
- **Bidirectional conversion** — editing either the "You pay" or "You receive" field recalculates the other side in real time using live price data.
- **Anchored token dropdown** — the token selector opens as a dropdown positioned directly below its trigger button (it follows the input instead of covering it), flipping above when there isn't enough room below. Searchable, closes on **ESC** or click-outside, and selecting a token already used on the other side auto-swaps the two sides.
- **Flip button** — swaps from/to tokens and preserves the displayed numbers (the old receive amount becomes the new pay amount).
- **MAX button** — fills the pay field with the token's full wallet balance.
- **Rate line** — shows `1 FROM ≈ X TO` with a refresh button that reloads the live price feed.
- **Input validation** with inline messaging covering all edge cases:
  - No token selected
  - Same token on both sides
  - Empty amount
  - Non-positive amount
  - Insufficient balance (also marks the pay field with an error border + `aria-invalid`)
- **Mocked submit** — "Swap" triggers a loading spinner + "Swapping…" state for 1.6 s, then shows a success banner and resets, returning to idle after 2.6 s. All timers are cleared on unmount.
- **Token icons** from the Switcheo token-icons GitHub repo, with a lettered fallback for any 404.
  - Case-mismatch fix applied: `RATOM→rATOM`, `STATOM→stATOM`, `STEVMOS→stEVMOS`, `STLUNA→stLUNA`, `STOSMO→stOSMO`.
- **Mock balances** — deterministic per-symbol (hash-seeded, worth ~$250–$12 250) so MAX and insufficient-balance validation feel realistic.

## Design decisions

- **Light theme** — white page background with barely-there tinted orbs (4–6% opacity); the swap card is a solid white surface (`#ffffff`) with a subtle light-gray border and soft shadow.
- **Fields** use a light-gray surface (`#f3f4f8`) with dark text (`#1b1d29`); the amount input is borderless — focus is indicated once, at the field level, by a violet ring (`.field:focus-within`), so there's no doubled outline around the number.
- **Accent gradient** (violet → pink-magenta) on the primary Swap button with a soft glow; disabled state is plainly muted.
- **Theming via CSS custom properties** in `index.css`, so the whole palette is a single coherent set of tokens rather than scattered overrides. `prefers-reduced-motion` is respected.
- **Shimmer skeleton** shown while the price feed loads; an error card with retry on network failure.
- Fully **responsive** (mobile-first, max-width 480 px card).
- **Accessible** — interactive controls have `aria-label`; the token trigger exposes `aria-haspopup="listbox"` + `aria-expanded`; live regions (`aria-live="polite"`) announce validation errors and success; the dropdown restores focus to its trigger on ESC.

## Architecture

```
src/
  main.tsx                    entry point
  App.tsx                     shell (header / background / footer)
  index.css                   CSS custom properties (design tokens) + reset
  App.css                     shell layout + light background
  types.ts                    RawPrice, Token, Side
  constants.ts                PRICES_URL, ICON_BASE, ICON_OVERRIDES, defaults
  lib/
    format.ts                 formatUsd, formatAmount, parseAmount, sanitizeAmount
    prices.ts                 fetchTokens (fetch → dedupe → filter → mock balance)
  hooks/
    useTokens.ts              loading / error / reload state hook
  components/
    Icon.tsx                  inline SVG icon set (data-driven, no library)
    TokenIcon.tsx             img with lettered fallback
    CurrencyField.tsx         amount input + token trigger; owns its anchored dropdown
    TokenSelectDropdown.tsx   searchable token list (anchored popover)
    TokenSelectDropdown.css   dropdown panel styles
    SwapCard.tsx              core stateful swap form
    SwapCard.css              card, fields, flip button, states, skeleton
    SwapCardSkeleton.tsx      shimmer loading placeholder
    ErrorCard.tsx             network error state with retry
```
## Notes

- No real backend — network/settlement is mocked (loading delay on submit), per the challenge hint.
- Prices are a static snapshot from the challenge feed; the refresh button re-fetches it.
