import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

const ITEMS = ["Deposit", "Buy", "Sale", "Withdrawal"];

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function InputForm() {
  const [date, setDate] = useState(todayStr());
  const [item, setItem] = useState("Deposit");
  const [shareCode, setShareCode] = useState("");
  const [shareUnit, setShareUnit] = useState("");
  const [sharePrice, setSharePrice] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const needsShareFields = item === "Buy" || item === "Sale";

  // Auto-calc amount from unit x price for Buy/Sale
  const handleUnitOrPrice = (unit, price) => {
    if (unit !== "" && price !== "") {
      const calc = Number(unit) * Number(price);
      setAmount(String(Number.isFinite(calc) ? calc : ""));
    }
  };

  const reset = () => {
    setShareCode("");
    setShareUnit("");
    setSharePrice("");
    setAmount("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !item || !amount) {
      setMessage("Please fill in Date, Item and Amount.");
      return;
    }
    if (needsShareFields && (!shareCode || !shareUnit || !sharePrice)) {
      setMessage("Share Code, Unit and Price are required for Buy/Sale.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      await addDoc(collection(db, "transactions"), {
        date,
        item,
        shareCode: needsShareFields ? shareCode.toUpperCase().trim() : "",
        shareUnit: needsShareFields ? Number(shareUnit) : null,
        sharePrice: needsShareFields ? Number(sharePrice) : null,
        amount: Number(amount),
        createdAt: Date.now(),
        serverCreatedAt: serverTimestamp(),
      });
      setMessage("Transaction saved.");
      reset();
    } catch (err) {
      console.error(err);
      setMessage("Failed to save. Check your Firebase config.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5 text-left">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Item</label>
        <select
          value={item}
          onChange={(e) => {
            setItem(e.target.value);
            reset();
          }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {ITEMS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      {needsShareFields && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Share Code</label>
            <input
              type="text"
              value={shareCode}
              onChange={(e) => setShareCode(e.target.value)}
              placeholder="e.g. MAYBANK"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Share Unit</label>
            <input
              type="number"
              step="any"
              value={shareUnit}
              onChange={(e) => {
                setShareUnit(e.target.value);
                handleUnitOrPrice(e.target.value, sharePrice);
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Share Price</label>
            <input
              type="number"
              step="any"
              value={sharePrice}
              onChange={(e) => {
                setSharePrice(e.target.value);
                handleUnitOrPrice(shareUnit, e.target.value);
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
        <input
          type="number"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {needsShareFields && (
          <p className="text-xs text-slate-400 mt-1">Auto-filled from Unit x Price — you can override.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-indigo-600 text-white py-2.5 font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Transaction"}
      </button>

      {message && <p className="text-sm text-slate-500">{message}</p>}
    </form>
  );
}
