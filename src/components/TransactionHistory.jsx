import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { buildHistory } from "../lib/portfolio";

const fmt = (n) =>
  Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function TransactionHistory({ transactions }) {
  const rows = buildHistory(transactions);

  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    await deleteDoc(doc(db, "transactions", id));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-300 text-slate-500">
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Details</th>
            <th className="py-2 pr-4 text-right">Inflow</th>
            <th className="py-2 pr-4 text-right">Outflow</th>
            <th className="py-2 pr-4 text-right">Balance</th>
            <th className="py-2 pr-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-slate-400">
                No transactions yet.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-slate-100">
              <td className="py-2 pr-4 whitespace-nowrap">{r.date}</td>
              <td className="py-2 pr-4">{r.details}</td>
              <td className="py-2 pr-4 text-right text-emerald-600">
                {r.inflow ? fmt(r.inflow) : ""}
              </td>
              <td className="py-2 pr-4 text-right text-rose-600">
                {r.outflow ? fmt(r.outflow) : ""}
              </td>
              <td className="py-2 pr-4 text-right font-medium">{fmt(r.balance)}</td>
              <td className="py-2 pr-2 text-right">
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-slate-400 hover:text-rose-500 text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
