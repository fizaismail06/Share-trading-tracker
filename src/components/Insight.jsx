import { buildInsight } from "../lib/portfolio";

const fmt = (n) =>
  Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtPct = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

const gainColor = (n) => (n > 0 ? "text-emerald-600" : n < 0 ? "text-rose-600" : "text-slate-700");

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${color || "text-slate-800"}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

const BAR_COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-teal-500",
  "bg-fuchsia-500",
];

export default function Insight({ transactions, currentPrices }) {
  const {
    netInjection,
    totalDeposit,
    totalWithdrawal,
    marketValue,
    growthPct,
    realisedGain,
    unrealisedGain,
    totalGain,
    allocation,
    tradeCounts,
    totalTrades,
  } = buildInsight(transactions, currentPrices);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-semibold text-slate-500 mb-3">Growth</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            label="Total Injection (Net)"
            value={fmt(netInjection)}
            sub={`Deposits ${fmt(totalDeposit)} - Withdrawals ${fmt(totalWithdrawal)}`}
          />
          <StatCard label="Market Value" value={fmt(marketValue)} sub="Cash + all holdings" />
          <StatCard
            label="Growth"
            value={fmtPct(growthPct)}
            sub="(Market Value - Injection) / Injection"
            color={gainColor(growthPct)}
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-500 mb-3">Gain / Loss</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            label="Realised Gain"
            value={fmt(realisedGain)}
            sub="From completed disposals"
            color={gainColor(realisedGain)}
          />
          <StatCard
            label="Unrealised Gain"
            value={fmt(unrealisedGain)}
            sub="On current holdings"
            color={gainColor(unrealisedGain)}
          />
          <StatCard
            label="Total Gain"
            value={fmt(totalGain)}
            sub="Realised + Unrealised"
            color={gainColor(totalGain)}
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-500 mb-3">Portfolio Allocation</h2>
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          {allocation.length === 0 && (
            <p className="text-sm text-slate-400">No holdings yet.</p>
          )}
          {allocation.map((a, i) => (
            <div key={a.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">{a.label}</span>
                <span className="text-slate-500">
                  {fmt(a.value)} ({a.pct.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                  style={{ width: `${Math.min(a.pct, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-500 mb-3">Trade Activity</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Deposits" value={tradeCounts.Deposit} />
          <StatCard label="Withdrawals" value={tradeCounts.Withdrawal} />
          <StatCard label="Buys" value={tradeCounts.Buy} />
          <StatCard label="Sales" value={tradeCounts.Sale} />
        </div>
        <p className="text-xs text-slate-400 mt-2">{totalTrades} total entries recorded.</p>
      </div>
    </div>
  );
}
