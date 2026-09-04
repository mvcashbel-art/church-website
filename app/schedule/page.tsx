"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export interface ScheduledServiceItem {
  id: string;
  serviceType: string;
  title: string;
  time: string;
  date: string; // YYYY-MM-DD
  duties: { role: string; assignedTo: string }[];
}

export default function SchedulePage() {
  const [services, setServices] = useState<ScheduledServiceItem[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("church_multi_schedules");
    if (saved) {
      try {
        const parsed: ScheduledServiceItem[] = JSON.parse(saved);
        const now = new Date();

        // Filter out services where the day has already completely passed (after 11:59:59 PM)
        const active = parsed.filter((item) => {
          if (!item.date) return true;
          const endOfDay = new Date(item.date);
          endOfDay.setHours(23, 59, 59, 999);
          return now.getTime() <= endOfDay.getTime();
        });

        // Sort ascending: closest date first
        active.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setServices(active);
      } catch (e) {}
    }
  }, []);

  const handleCopy = () => {
    if (services.length === 0) return;
    let text = `✝ Tubod Seventh-day Adventist Church - Upcoming Duties\n\n`;

    services.forEach((s) => {
      const formattedDate = s.date
        ? new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "Upcoming";
      text += `📅 ${s.serviceType.toUpperCase()} (${formattedDate} - ${s.time})\n`;
      s.duties.forEach((d) => {
        text += `• ${d.role}: ${d.assignedTo || "—"}\n`;
      });
      text += `\n`;
    });

    text += `Please review your assignments. God bless! 🙏`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-blue-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-blue-900 text-sm sm:text-base flex items-center gap-2">
            <span>✝</span> Tubod Seventh-day Adventist Church
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>{copied ? "✓" : "📋"}</span>
              <span>{copied ? "Copied!" : "Copy for Messenger"}</span>
            </button>
            <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-10">
        <div className="text-center space-y-2 mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] tracking-wider uppercase">
            Active Worship Rosters
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            Upcoming Worship Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Sorted chronologically by nearest schedule. Automatically clears once service day concludes.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs">
            <span className="text-3xl">🗓️</span>
            <h3 className="font-bold text-slate-800 mt-2">No Active Upcoming Services</h3>
            <p className="text-xs text-slate-500 mt-1">
              All previous services have finished. New rosters will appear here when scheduled by the church clerk.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {services.map((item, index) => {
              const formattedDate = item.date
                ? new Date(item.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Upcoming Service";

              const isNearest = index === 0;

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${
                    isNearest ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200/80"
                  }`}
                >
                  <div className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    isNearest ? "bg-blue-950 text-white" : "bg-slate-900 text-white"
                  }`}>
                    <div>
                      {isNearest && (
                        <span className="inline-block bg-amber-400 text-amber-950 font-black text-[10px] uppercase px-2 py-0.5 rounded tracking-wide mb-1">
                          ⚡ Next Upcoming Service
                        </span>
                      )}
                      <h2 className="font-bold text-base tracking-wide flex items-center gap-2">
                        <span>{item.serviceType}</span>
                        <span className="opacity-60">•</span>
                        <span className="text-xs text-blue-200 font-normal">{item.title}</span>
                      </h2>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xs font-bold text-blue-300">{formattedDate}</div>
                      <div className="text-[11px] text-slate-300">{item.time}</div>
                    </div>
                  </div>

                  <div className="p-6 grid sm:grid-cols-2 gap-3 text-xs sm:text-sm divide-y sm:divide-y-0 divide-slate-100">
                    {item.duties.map((duty, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-600 font-medium">{duty.role}</span>
                        <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200 text-right">
                          {duty.assignedTo || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
