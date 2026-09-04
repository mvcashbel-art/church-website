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
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    let candidateList: { name: string; time: string; targetDate: Date }[] = [];

    // 1. Gather all services from multi-schedules
    const savedMulti = localStorage.getItem("church_multi_schedules");
    if (savedMulti) {
      try {
        const list: ScheduledServiceItem[] = JSON.parse(savedMulti);
        list.forEach((item) => {
          if (item.date) {
            const d = new Date(item.date);
            if (!isNaN(d.getTime())) {
              candidateList.push({
                name: `${item.serviceType} | ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                time: item.time,
                targetDate: d,
              });
            }
          }
        });
      } catch (e) {}
    }

    // 2. Also check legacy schedule
    const savedLegacy = localStorage.getItem("church_duty_schedule");
    if (savedLegacy) {
      try {
        const leg = JSON.parse(savedLegacy);
        if (leg.dateRange) {
          const rawDate = leg.dateRange.includes("|") ? leg.dateRange.split("|")[1].trim() : leg.dateRange;
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            candidateList.push({
              name: leg.dateRange,
              time: "Active Worship Program",
              targetDate: d,
            });
          }
        }
      } catch (e) {}
    }

    // 3. Also check top yellow announcement banner if it has a date
    const savedBanner = localStorage.getItem("church_banner");
    if (savedBanner && candidateList.length === 0) {
      const match = savedBanner.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/i);
      if (match) {
        const d = new Date(match[0]);
        if (!isNaN(d.getTime())) {
          candidateList.push({
            name: "Sabbath Worship Day | September 5, 2026",
            time: "Saturday - 8:30 AM",
            targetDate: d,
          });
        }
      }
    }

    const now = new Date();

    // Filter out services where midnight has passed
    const futureServices = candidateList.filter((item) => {
      const endOfDay = new Date(item.targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      return now.getTime() <= endOfDay.getTime();
    });

    if (futureServices.length === 0) {
      setVisible(false);
      return;
    }

    // Sort by whichever date is closest to right now
    futureServices.sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());

    const nearest = futureServices[0];
    const diffMs = nearest.targetDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    const isSameDay =
      now.getFullYear() === nearest.targetDate.getFullYear() &&
      now.getMonth() === nearest.targetDate.getMonth() &&
      now.getDate() === nearest.targetDate.getDate();

    if (isSameDay) {
      setBadgeText("🔴 Happening Today!");
      setIsUrgent(true);
    } else if (diffHours > -12 && diffHours <= 36) {
      // Handles tomorrow / within 24–36 hours
      setBadgeText("⚡ Tomorrow / In < 24 Hours");
      setIsUrgent(true);
    } else {
      const days = Math.ceil(diffHours / 24);
      setBadgeText(`⏳ In ${days} Days`);
      setIsUrgent(false);
    }

    setTitle(nearest.name);
    setSubtitle(nearest.time);
    setVisible(true);
  }, [pathname]);

  if (!visible || pathname === "/schedule" || pathname === "/admin") return null;

  return (
    <aside
      aria-label="Upcoming worship service reminder"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-[90vw] sm:w-80 transition-all duration-300"
    >
      <div
        className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex flex-col gap-2 ${
          isUrgent
            ? "bg-amber-500 text-slate-950 border-amber-600 shadow-amber-500/30"
            : "bg-slate-900/95 text-white border-slate-700 shadow-slate-950/40"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isUrgent ? "bg-rose-700" : "bg-blue-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isUrgent ? "bg-rose-700" : "bg-blue-500"
              }`}
            />
          </span>
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
              isUrgent ? "bg-black/20 text-slate-950" : "bg-blue-600/30 text-blue-300"
            }`}
          >
            {badgeText}
          </span>
        </div>

        <div>
          <h4 className="font-extrabold text-sm leading-tight line-clamp-1 mt-1">
            {title}
          </h4>
          <p
            className={`text-xs mt-0.5 ${
              isUrgent ? "text-slate-950 font-medium" : "text-slate-300"
            }`}
          >
            {subtitle} • Please review duty assignments.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-black/10 mt-1">
          <Link
            href="/schedule"
            className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors ${
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
