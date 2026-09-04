"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ScheduledServiceItem {
  id: string;
  serviceType: string;
  title: string;
  time: string;
  date: string;
  duties: { role: string; assignedTo: string }[];
}

interface AlertItem {
  id: string;
  serviceType: string;
  time: string;
  date: string;
  badgeText: string;
  isUrgent: boolean;
}

export default function ServiceAlertToast() {
  const pathname = usePathname();
  const [items, setItems] = useState<AlertItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadAlerts = () => {
    let candidateList: AlertItem[] = [];
    const now = new Date();

    const savedMulti = localStorage.getItem("church_multi_schedules");
    if (savedMulti) {
      try {
        const list: ScheduledServiceItem[] = JSON.parse(savedMulti);
        
        // Filter active services (hasn't passed midnight of service day)
        const valid = list.filter((item) => {
          if (!item.date) return false;
          const endOfDay = new Date(item.date);
          endOfDay.setHours(23, 59, 59, 999);
          return now.getTime() <= endOfDay.getTime();
        });

        // Sort ascending: nearest date first
        valid.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        valid.forEach((item) => {
          const target = new Date(item.date);
          const diffMs = target.getTime() - now.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);

          const isSameDay =
            now.getFullYear() === target.getFullYear() &&
            now.getMonth() === target.getMonth() &&
            now.getDate() === target.getDate();

          let badge = "🗓️ Upcoming";
          let urgent = false;

          if (isSameDay) {
            badge = "🔴 Happening Today!";
            urgent = true;
          } else if (diffHours > -12 && diffHours <= 36) {
            badge = "⚡ Tomorrow / In < 24h";
            urgent = true;
          } else {
            const days = Math.ceil(diffHours / 24);
            badge = `⏳ In ${days} Days`;
          }

          candidateList.push({
            id: item.id,
            serviceType: item.serviceType,
            time: item.time,
            date: target.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            badgeText: badge,
            isUrgent: urgent,
          });
        });
      } catch (e) {}
    }

    setItems(candidateList);
    setCurrentIndex(0);
  };

  useEffect(() => {
    loadAlerts();

    window.addEventListener("church_data_updated", loadAlerts);
    window.addEventListener("storage", loadAlerts);

    return () => {
      window.removeEventListener("church_data_updated", loadAlerts);
      window.removeEventListener("storage", loadAlerts);
    };
  }, [pathname]);

  if (items.length === 0 || pathname === "/schedule" || pathname === "/admin") {
    return null;
  }

  const current = items[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <aside
      aria-label="Upcoming worship services"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-[92vw] sm:w-80 transition-all duration-300 select-none"
    >
      <div
        className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex flex-col gap-2.5 transition-colors duration-300 ${
          current.isUrgent
            ? "bg-amber-500 text-slate-950 border-amber-600 shadow-amber-500/25"
            : "bg-slate-900/95 text-white border-slate-700 shadow-slate-950/40"
        }`}
      >
        {/* TOP STATUS BAR WITH SCROLL CONTROLS */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  current.isUrgent ? "bg-rose-700" : "bg-blue-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  current.isUrgent ? "bg-rose-700" : "bg-blue-500"
                }`}
              />
            </span>
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                current.isUrgent ? "bg-black/20 text-slate-950" : "bg-blue-600/30 text-blue-300"
              }`}
            >
              {current.badgeText}
            </span>
          </div>

          {/* ARROWS FOR SCROLLING THROUGH SERVICES */}
          {items.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono opacity-70 mr-1">
                {currentIndex + 1}/{items.length}
              </span>
              <button
                onClick={handlePrev}
                title="Previous Service"
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold transition ${
                  current.isUrgent
                    ? "bg-black/15 hover:bg-black/25 text-slate-950"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                ‹
              </button>
              <button
                onClick={handleNext}
                title="Next Service"
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold transition ${
                  current.isUrgent
                    ? "bg-black/15 hover:bg-black/25 text-slate-950"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* SERVICE INFO (CHANGES AS YOU SCROLL) */}
        <div>
          <h4 className="font-black text-sm leading-tight truncate">
            {current.serviceType}
          </h4>
          <p
            className={`text-xs mt-0.5 leading-snug truncate ${
              current.isUrgent ? "text-slate-950 font-semibold" : "text-slate-300"
            }`}
          >
            {current.date} • {current.time}
          </p>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="pt-2 flex items-center justify-between border-t border-black/10 mt-0.5">
          <Link
            href="/schedule"
            className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all ${
              current.isUrgent
                ? "bg-slate-950 text-white hover:bg-slate-800"
                : "bg-blue-600 text-white hover:bg-blue-500"
            }`}
          >
            View Duty Roster &rarr;
          </Link>
          <span className="text-[10px] opacity-70 font-medium">Tubod SDA</span>
        </div>
      </div>
    </aside>
  );
}
