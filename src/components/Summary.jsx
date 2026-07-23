import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { buildSummary } from "../lib/portfolio";

const fmt = (n) =>
  Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Summary({ transactions, currentPrices }) {
  const { cash, shareRows: allRows } = buildSummary(transactions, currentPrices);
  const [editingCode, setEditingCode] = useState(null);
  const [priceInput, setPriceInput] = useState("");
  const [showClosed, setShowClosed] = useState(false);

  const closedCount = allRows.filter((r) => r.unit <= 0.0000001).length;
  const shareRows = showClosed ? allRows : allRows.filter((r) => r.unit > 0.0000001);

  const totalMv = allRows.reduce((s, r) => s + r.mv, 0) + cash;

  const startEdit = (code, current) => {
    setEditingCode(code);
    setPriceInput(current ? String(current) : "");
  };

  const savePrice = async (code) => {
    await setDoc(doc(db, "currentPrices", code), { price: Number(priceInput) || 0 });
    setEditingCode(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setShowClosed(false)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              !showClosed ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Active Holdings
          </button>
          <button
            onClick={() => setShowClosed(true)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              showClosed ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All (incl. Closed)
          </button>
        </div>
        {!showClosed && closedCount > 0 && (
          <span className="text-xs text-slate-400">{closedCount} closed position(s) hidden</span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-300 text-slate-500">
              <th className="py-2 pr-4"></th>
              <th className="py-2 pr-4 text-right">Unit</th>
              <th className="py-2 pr-4 text-right">Purchase Price</th>
              <th className="py-2 pr-4 text-right">Total Purchase Price</th>
              <th className="py-2 pr-4 text-right">Realised Gain</th>
              <th className="py-2 pr-4 text-right">Current Price</th>
              <th className="py-2 pr-4 text-right">MV</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-2 pr-4 font-medium">Cash</td>
              <td className="py-2 pr-4 text-right">-</td>
              <td className="py-2 pr-4 text-right">-</td>
              <td className="py-2 pr-4 text-right">-</td>
              <td className="py-2 pr-4 text-right">-</td>
              <td className="py-2 pr-4 text-right">-</td>
              <td className="py-2 pr-4 text-right font-medium">{fmt(cash)}</td>
            </tr>
            {shareRows.map((r) => (
              <tr key={r.shareCode} className="border-b border-slate-100">
                <td className="py-2 pr-4 font-medium">{r.shareCode}</td>
                <td className="py-2 pr-4 text-right">{fmt(r.unit)}</td>
                <td className="py-2 pr-4 text-right">{fmt(r.purchasePrice)}</td>
                <td className="py-2 pr-4 text-right">{fmt(r.totalPurchasePrice)}</td>
                <td
                  className={`py-2 pr-4 text-right ${
                    r.realisedGain > 0 ? "text-emerald-600" : r.realisedGain < 0 ? "text-rose-600" : ""
                  }`}
                >
                  {fmt(r.realisedGain)}
                </td>
                <td className="py-2 pr-4 text-right">
                  {editingCode === r.shareCode ? (
                    <div className="flex items-center gap-1 justify-end">
                      <input
                        autoFocus
                        type="number"
                        step="any"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && savePrice(r.shareCode)}
                        className="w-24 rounded border border-slate-300 px-2 py-1 text-right"
                      />
                      <button
                        onClick={() => savePrice(r.shareCode)}
                        className="text-indigo-600 text-xs font-medium"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(r.shareCode, r.currentPrice)}
                      className="hover:underline decoration-dotted"
                      title="Click to update current price"
                    >
                      {r.currentPrice ? fmt(r.currentPrice) : "Set price"}
                    </button>
                  )}
                </td>
                <td className="py-2 pr-4 text-right font-medium">{fmt(r.mv)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} className="py-3 pr-4 text-right font-semibold text-slate-600">
                Total Portfolio Value
              </td>
              <td className="py-3 pr-4 text-right font-semibold">{fmt(totalMv)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {shareRows.length === 0 && (
        <p className="text-center text-slate-400 text-sm">No share holdings yet — record a Buy transaction to get started.</p>
      )}
    </div>
  );
}
