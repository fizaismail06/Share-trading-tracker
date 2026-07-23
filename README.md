# Share Trading Tracker

A small React + Vite + Tailwind v4 + Firebase PWA for recording your trading
activity, built the same way as your Salary Tracker.

## Tabs

1. **Input Form** — Date, Item (Deposit / Buy / Sale / Withdrawal), and (only
   for Buy/Sale) Share Code, Share Unit, Share Price. Amount auto-fills from
   Unit x Price for Buy/Sale but can be overridden.
2. **Transaction History** — Date, Details, Inflow, Outflow, running cash
   Balance, sorted by date.
3. **Summary** — portfolio position: a Cash row plus one row per share code,
   showing Unit held, average Purchase Price, Total Purchase Price, Realised
   Gain (from partial/full disposals), a manually-entered Current Price
   (click to edit), and the resulting Market Value. A Total Portfolio Value
   is shown at the bottom (cash + all market values).

## How the numbers are calculated

- **Cash balance**: Deposit and Sale add to cash; Withdrawal and Buy
  subtract from cash.
- **Average cost method**: each Buy adds units and cost to that share's
  holding. Each Sale sells at the current average cost, and books the
  difference between sale proceeds and cost-of-units-sold as Realised Gain.
  This correctly handles partial disposals.
- **Market Value**: units currently held x the manually-entered Current
  Price (there's no live price feed — click the price cell in the Summary
  tab to update it any time).

## Setup

1. Create a Firebase project (or reuse an existing one) and enable
   **Firestore Database**.
2. Copy your Firebase web app config into `src/lib/firebase.js`
   (replace the placeholder values).
3. Install dependencies and run locally:

   ```bash
   npm install
   npm run dev
   ```

4. Deploy (same flow as your other apps):

   ```bash
   npm run build
   firebase deploy
   ```

## Before going live

`firestore.rules` is left open (`allow read, write: if true`) for quick
personal setup. Before you rely on this for real trading records, add
Firebase Auth and restrict rules to your own uid — same as you'd do for
FinTrack/Estate Vault.
