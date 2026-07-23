// Derives cash balance, transaction history balances, and portfolio
// summary (average-cost method) from a flat list of transactions.
//
// Transaction shape:
// { id, date, item: 'Deposit'|'Buy'|'Sale'|'Withdrawal',
//   shareCode, shareUnit, sharePrice, amount, createdAt }

export function sortTransactions(transactions) {
  return [...transactions].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.createdAt || 0) - (b.createdAt || 0);
  });
}

// Builds the Transaction History rows: Date, Details, Inflow, Outflow, Balance (cash)
export function buildHistory(transactions) {
  const sorted = sortTransactions(transactions);
  let balance = 0;
  return sorted.map((t) => {
    const isInflow = t.item === "Deposit" || t.item === "Sale";
    const inflow = isInflow ? Number(t.amount) : 0;
    const outflow = !isInflow ? Number(t.amount) : 0;
    balance += inflow - outflow;

    let details = t.item;
    if (t.item === "Buy" || t.item === "Sale") {
      details = `${t.item} ${t.shareUnit} ${t.shareCode} @ ${t.sharePrice}`;
    }

    return { ...t, details, inflow, outflow, balance };
  });
}

// Builds the Summary rows: Cash + one row per share code, average-cost method.
// currentPrices: { [shareCode]: number } — manually entered current market price
export function buildSummary(transactions, currentPrices = {}) {
  const sorted = sortTransactions(transactions);

  let cash = 0;
  const holdings = {}; // shareCode -> { units, totalCost, realisedGain }

  for (const t of sorted) {
    const amount = Number(t.amount) || 0;

    if (t.item === "Deposit") {
      cash += amount;
    } else if (t.item === "Withdrawal") {
      cash -= amount;
    } else if (t.item === "Buy") {
      cash -= amount;
      const code = t.shareCode;
      const unit = Number(t.shareUnit) || 0;
      const cost = unit * (Number(t.sharePrice) || 0);
      if (!holdings[code]) {
        holdings[code] = { units: 0, totalCost: 0, realisedGain: 0 };
      }
      holdings[code].units += unit;
      holdings[code].totalCost += cost;
    } else if (t.item === "Sale") {
      cash += amount;
      const code = t.shareCode;
      const unit = Number(t.shareUnit) || 0;
      const salePrice = Number(t.sharePrice) || 0;
      const h = holdings[code];
      if (h && h.units > 0) {
        const avgCost = h.totalCost / h.units;
        const soldUnits = Math.min(unit, h.units);
        const costOfSold = avgCost * soldUnits;
        const gain = soldUnits * salePrice - costOfSold;
        h.realisedGain += gain;
        h.units -= soldUnits;
        h.totalCost -= costOfSold;
      }
    }
  }

  const shareRows = Object.entries(holdings)
    .filter(([, h]) => h.units > 0.0000001 || Math.abs(h.realisedGain) > 0.0000001)
    .map(([code, h]) => {
      const avgPrice = h.units > 0 ? h.totalCost / h.units : 0;
      const currentPrice = Number(currentPrices[code]) || 0;
      const mv = h.units * currentPrice;
      return {
        shareCode: code,
        unit: h.units,
        purchasePrice: avgPrice,
        totalPurchasePrice: h.totalCost,
        realisedGain: h.realisedGain,
        currentPrice,
        mv,
      };
    })
    .sort((a, b) => a.shareCode.localeCompare(b.shareCode));

  return { cash, shareRows };
}
