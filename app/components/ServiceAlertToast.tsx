"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ServiceDuty {
  role: string;
  assignedTo: string;
}

interface ServiceSchedule {
  title: string;
  time: string;
  enabled: boolean;
  duties: ServiceDuty[];
}

interface WeekSchedule {
  dateRange: string;
  midweek: ServiceSchedule;
  vespers: ServiceSchedule;
  sabbathSchool: ServiceSchedule;
  divineWorship: ServiceSchedule;
  ay: ServiceSchedule;
}

export default function ServiceAlertToast() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [statusBadge, setStatusBadge] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const savedSchedule = localStorage.getItem("church_duty_schedule");
    if (!savedSchedule) return;

    try {
      const schedule: WeekSchedule = JSON.parse(savedSchedule);
      const header = schedule.dateRange;

      setScheduleTitle(header);

      const datePart = header.includes("|") ? header.split("|")[1].trim() : header;
      const targetDate = new Date(datePart);

      if (!isNaN(targetDate.getTime())) {
        const now = new Date();

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        if (now.getTime() > endOfDay.getTime()) {
          setVisible(false);
          return;
        }

        const isSameDay =
          now.getFullYear() === targetDate.getFullYear() &&
          now.getMonth() === targetDate.getMonth() &&
          now.getDate() === targetDate.getDate();

        const diffHours = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (isSameDay) {
          setStatusBadge("🔴 Happening Today!");
          setIsUrgent(true);
          setVisible(true);
        } else if (diffHours > 0 && diffHours <= 24) {
          setStatusBadge("⚡ Tomorrow / In < 24 Hours");
          setIsUrgent(true);
          setVisible(true);
        } else if (diffHours > 24 && diffHours <= 72) {
          const days = Math.ceil(diffHours / 24);
          setStatusBadge(`⏳ In ${days} Days`);
          setIsUrgent(false);
          setVisible(true);
        } else {
          setStatusBadge("🗓️ Upcoming Service");
          setIsUrgent(false);
          setVisible(true);
        }
      } else {
        setStatusBadge("🗓️ Active Duty Schedule");
        setVisible(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (!visible || pathname === "/schedule") return null;

  return (
    <aside
      aria-label="Upcoming worship service reminder"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-[90vw] sm:w-80 transition-all duration-300 transform translate-y-0"
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
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isUrgent ? "bg-rose-600" : "bg-blue-400"
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isUrgent ? "bg-rose-600" : "bg-blue-500"
              }`}
            ></span>
          </span>
          <span
            className={`text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
              isUrgent ? "bg-black/20 text-slate-950" : "bg-blue-600/30 text-blue-300"
            }`}
          >
            {statusBadge}
          </span>
        </div>

        <div>
          <h4 className="font-bold text-sm leading-tight line-clamp-2 mt-1">
            {scheduleTitle || "Active Worship Service"}
          </h4>
          <p
            className={`text-xs mt-1 leading-relaxed ${
              isUrgent ? "text-slate-900 font-medium" : "text-slate-300"
            }`}
          >
            Active schedule roster. Please review duty assignments.
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