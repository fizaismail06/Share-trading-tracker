import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "./lib/firebase";
import InputForm from "./components/InputForm";
import TransactionHistory from "./components/TransactionHistory";
import Summary from "./components/Summary";
import Login from "./components/Login";

const TABS = ["Input Form", "Transaction History", "Summary"];

export default function App() {
  const [tab, setTab] = useState("Input Form");
  const [transactions, setTransactions] = useState([]);
  const [currentPrices, setCurrentPrices] = useState({});
  const [user, setUser] = useState(undefined); // undefined = checking, null = signed out

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "transactions"), (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "currentPrices"), (snap) => {
      const prices = {};
      snap.docs.forEach((d) => {
        prices[d.id] = d.data().price;
      });
      setCurrentPrices(prices);
    });
    return unsub;
  }, [user]);

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">Share Trading Tracker</h1>
          <button
            onClick={() => signOut(auth)}
            className="text-sm text-slate-500 hover:text-rose-600"
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="max-w-3xl mx-auto px-4">
        <div className="flex gap-2 border-b border-slate-200 mt-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {tab === "Input Form" && <InputForm />}
        {tab === "Transaction History" && <TransactionHistory transactions={transactions} />}
        {tab === "Summary" && <Summary transactions={transactions} currentPrices={currentPrices} />}
      </main>
    </div>
  );
}
