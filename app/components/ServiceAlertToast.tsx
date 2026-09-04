"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  const [visible, setVisible] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [daysRemainingText, setDaysRemainingText] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    // Check if user dismissed it this session
    const dismissed = sessionStorage.getItem("dismiss_service_alert");
    if (dismissed) return;

    const savedSchedule = localStorage.getItem("church_duty_schedule");
    if (!savedSchedule) return;

    try {
      const schedule: WeekSchedule = JSON.parse(savedSchedule);
      const header = schedule.dateRange; // e.g. "Midweek Worship | September 9, 2026"

      setScheduleTitle(header);

      // Attempt to extract the date portion after the pipe "|"
      const datePart = header.includes("|") ? header.split("|")[1].trim() : header;
      const targetTime = new Date(datePart).getTime();

      if (!isNaN(targetTime)) {
        const now = new Date().getTime();
        const diffHours = (targetTime - now) / (1000 * 60 * 60);

        if (diffHours < -24) {
          // Event already ended more than a day ago
          setVisible(false);
        } else if (diffHours <= 0 && diffHours >= -24) {
          // Happening today!
          setDaysRemainingText("🔴 Happening Today!");
          setIsUrgent(true);
          setVisible(true);
        } else if (diffHours > 0 && diffHours <= 24) {
          // Tomorrow or under 24 hours
          setDaysRemainingText("⚡ Tomorrow / In less than 24 hours!");
          setIsUrgent(true);
          setVisible(true);
        } else if (diffHours > 24 && diffHours <= 72) {
          // In 2-3 days
          const days = Math.ceil(diffHours / 24);
          setDaysRemainingText(`⏳ In ${days} days`);
          setIsUrgent(false);
          setVisible(true);
        } else {
          // Show upcoming alert if within a week
          setDaysRemainingText("🗓️ Upcoming Service");
          setIsUrgent(false);
          setVisible(true);
        }
      } else {
        // If it's a custom text header with no clean date, still show notification
        setDaysRemainingText("🗓️ Active Duty Schedule");
        setVisible(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem("dismiss_service_alert", "true");
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Upcoming worship service reminder"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-[90vw] sm:w-80 transition-all duration-300 transform translate-y-0"
    >
      <div
        className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex flex-col gap-2 ${
          isUrgent
            ? "bg-amber-500/95 border-amber-600 text-slate-950 animate-bounce-short"
            : "bg-slate-900/95 border-slate-700 text-white"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
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
              {daysRemainingText}
            </span>
          </div>

          <button
            onClick={handleDismiss}
            className={`text-xs p-1 rounded-full transition-colors ${
              isUrgent ? "hover:bg-amber-600 text-slate-900" : "hover:bg-slate-800 text-slate-400"
            }`}
            title="Dismiss alert"
          >
            ✕
          </button>
        </div>

        <div>
          <h4 className="font-bold text-sm leading-tight line-clamp-2 mt-1">
            {scheduleTitle || "Upcoming Worship Service"}
          </h4>
          <p
            className={`text-xs mt-1 leading-relaxed ${
              isUrgent ? "text-slate-900 font-medium" : "text-slate-300"
            }`}
          >
            Please check your assigned roles and duties for this gathering.
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