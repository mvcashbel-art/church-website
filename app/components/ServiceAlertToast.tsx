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

export default function ServiceAlertToast() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [nearest, setNearest] = useState<ScheduledServiceItem | null>(null);
  const [badgeText, setBadgeText] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("church_multi_schedules");
    if (!raw) {
      setVisible(false);
      return;
    }

    try {
      const list: ScheduledServiceItem[] = JSON.parse(raw);
      const now = new Date();

      // Filter active (today or future)
      const valid = list.filter((item) => {
        if (!item.date) return false;
        const endOfDay = new Date(item.date);
        endOfDay.setHours(23, 59, 59, 999);
        return now.getTime() <= endOfDay.getTime();
      });

      if (valid.length === 0) {
        setVisible(false);
        return;
      }

      // Sort by closest date
      valid.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const nextUp = valid[0];
      setNearest(nextUp);

      const target = new Date(nextUp.date);
      const isSameDay =
        now.getFullYear() === target.getFullYear() &&
        now.getMonth() === target.getMonth() &&
        now.getDate() === target.getDate();

      const diffHours = (target.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (isSameDay) {
        setBadgeText("🔴 Happening Today!");
        setIsUrgent(true);
      } else if (diffHours > 0 && diffHours <= 24) {
        setBadgeText("⚡ Tomorrow / In < 24h");
        setIsUrgent(true);
      } else if (diffHours > 24 && diffHours <= 72) {
        setBadgeText(`⏳ In ${Math.ceil(diffHours / 24)} Days`);
        setIsUrgent(false);
      } else {
        setBadgeText("🗓️ Next Service");
        setIsUrgent(false);
      }

      setVisible(true);
    } catch (e) {
      setVisible(false);
    }
  }, [pathname]);

  if (!visible || !nearest || pathname === "/schedule" || pathname === "/admin") return null;

  const formattedDate = new Date(nearest.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <aside
      aria-label="Upcoming worship service reminder"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-[90vw] sm:w-80 transition-all duration-300"
    >
      <div
        className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex flex-col gap-2 ${
          isUrgent
            ? "bg-amber-500/95 border-amber-600 text-slate-950 shadow-amber-500/20"
            : "bg-slate-900/95 border-slate-700 text-white shadow-slate-950/40"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isUrgent ? "bg-rose-600" : "bg-blue-400"
            }`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              isUrgent ? "bg-rose-600" : "bg-blue-500"
            }`} />
          </span>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
            isUrgent ? "bg-black/20 text-slate-950" : "bg-blue-600/30 text-blue-300"
          }`}>
            {badgeText}
          </span>
        </div>

        <div>
          <h4 className="font-bold text-sm leading-tight line-clamp-1 mt-1">
            {nearest.serviceType} • {formattedDate}
          </h4>
          <p className={`text-xs mt-0.5 leading-relaxed ${isUrgent ? "text-slate-950 font-medium" : "text-slate-300"}`}>
            {nearest.title} ({nearest.time})
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-black/10 mt-1">
          <Link
            href="/schedule"
            className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ${
              isUrgent
                ? "bg-slate-950 text-white hover:bg-slate-800"
                : "bg-blue-600 text-white hover:bg-blue-500"
            }`}
          >
            View Duty Roster &rarr;
          </Link>
          <span className="text-[10px] opacity-75">Tubod SDA</span>
        </div>
      </div>
    </aside>
  );
}
