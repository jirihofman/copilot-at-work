"use client";

import { useState, useEffect, useCallback } from "react";

const AGENTS = [
  { key: "copilot", label: "Copilot", color: "bg-blue-600", textColor: "text-blue-600" },
  { key: "claude", label: "Claude", color: "bg-orange-500", textColor: "text-orange-500" },
  { key: "cursor", label: "Cursor", color: "bg-green-600", textColor: "text-green-600" },
];

function toDateString(date) {
  return date.toISOString().split("T")[0];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return toDateString(d);
}

export default function CommitsPage() {
  const [date, setDate] = useState(() => toDateString(new Date()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCommits = useCallback(async (selectedDate) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/commits?date=${selectedDate}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to fetch data");
      } else {
        setData(json.data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommits(date);
  }, [date, fetchCommits]);

  const handlePrev = () => setDate((d) => addDays(d, -1));
  const handleNext = () => {
    const tomorrow = addDays(toDateString(new Date()), 1);
    setDate((d) => {
      const next = addDays(d, 1);
      return next >= tomorrow ? d : next;
    });
  };
  const isToday = date === toDateString(new Date());

  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg mb-2">
            Commits by Agents
          </h1>
          <p className="text-white/80 text-sm sm:text-base">
            Live data from GitHub — commits authored per day
          </p>
        </div>

        {/* Date navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6 mb-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              aria-label="Previous day"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-xl font-bold"
            >
              &#8592;
            </button>

            <input
              type="date"
              value={date}
              max={toDateString(new Date())}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleNext}
              aria-label="Next day"
              disabled={isToday}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 text-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              &#8594;
            </button>
          </div>
          <p className="text-xs text-gray-400">Use the calendar or arrows to navigate dates</p>
        </div>

        {/* Results */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Commits on <span className="text-blue-600">{date}</span>
          </h2>

          {loading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading…</div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500">{error}</div>
          )}

          {!loading && !error && data && (
            <div className="grid gap-4">
              {AGENTS.map(({ key, label, color, textColor }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${color} inline-block`} />
                    <span className="font-medium text-gray-800 dark:text-gray-200">{label}</span>
                    <span className="text-xs text-gray-400 hidden sm:inline">{data[key]?.name}</span>
                  </div>
                  <span className={`text-2xl font-black ${textColor}`}>
                    {data[key]?.count?.toLocaleString() ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Data is fetched live from GitHub GraphQL API.</p>
        </div>
      </div>
    </main>
  );
}
