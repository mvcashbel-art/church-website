"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ServiceWorship {
  role: string;
  assignedTo: string;
}

interface ServiceSchedule {
  title: string;
  time: string;
  enabled: boolean;
  duties: ServiceWorship[];
}

interface WeekSchedule {
  dateRange: string;
  midweek: ServiceSchedule;
  vespers: ServiceSchedule;
  sabbathSchool: ServiceSchedule;
  divineWorship: ServiceSchedule;
  ay: ServiceSchedule;
}

const DEFAULT_SCHEDULE: WeekSchedule = {
  dateRange: "Midweek Worship | September 9, 2026",
  midweek: {
    title: "Wednesday Prayer Meeting",
    time: "Wednesday - 6:30 PM",
    enabled: true,
    duties: [
      { role: "Leader / Moderator", assignedTo: "Worship Leader / Elder" },
      { role: "Devotional Speaker", assignedTo: "Assigned Speaker" },
      { role: "Intercessory Prayer", assignedTo: "Prayer Ministry" },
    ],
  },
  vespers: {
    title: "Friday Vesper Worship",
    time: "Friday - 6:30 PM",
    enabled: false,
    duties: [
      { role: "Song Leader", assignedTo: "Music Ministry" },
      { role: "Devotional Message", assignedTo: "Assigned Speaker" },
      { role: "Opening / Closing Prayer", assignedTo: "Assigned Member" },
    ],
  },
  sabbathSchool: {
    title: "Sabbath School",
    time: "Saturday - 8:30 AM",
    enabled: false,
    duties: [
      { role: "Superintendent", assignedTo: "SS Superintendent" },
      { role: "Song Leader / Chorister", assignedTo: "Music Ministry" },
      { role: "Mission Story Reader", assignedTo: "Youth Volunteer" },
      { role: "Lesson Teachers", assignedTo: "Class Teachers" },
    ],
  },
  divineWorship: {
    title: "Divine Worship Service",
    time: "Saturday - 10:30 AM",
    enabled: false,
    duties: [
      { role: "Platform Elder", assignedTo: "First Elder" },
      { role: "Preacher / Speaker", assignedTo: "Church Pastor / Elder" },
      { role: "Scripture Reading", assignedTo: "Youth Reader" },
      { role: "Pastoral Prayer", assignedTo: "Ordained Elder" },
      { role: "Offertory / Deacons", assignedTo: "Head Deacon & Team" },
    ],
  },
  ay: {
    title: "Adventist Youth (AY) Service",
    time: "Saturday - 3:30 PM",
    enabled: false,
    duties: [
      { role: "AY Program Leader", assignedTo: "AY Sponsor" },
      { role: "Song Service", assignedTo: "AY Praise Team" },
      { role: "Special Musical Item", assignedTo: "Choir / Soloist" },
      { role: "Vespers / Closing Sunset", assignedTo: "AY Leader" },
    ],
  },
};

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("church_Worship_schedule");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSchedule({ ...DEFAULT_SCHEDULE, ...parsed });
      } catch (e) {}
    }
  }, []);

  const serviceKeys = ["midweek", "vespers", "sabbathSchool", "divineWorship", "ay"] as const;
  const activeServices = serviceKeys.filter((key) => schedule[key]?.enabled === true);

  const handleCopy = () => {
    let text = `✝ Tubod Seventh-day Adventist Church\n📅 ${schedule.dateRange}\n\n`;

    activeServices.forEach((key) => {
      const s = schedule[key];
      text += `--- ${s.title.toUpperCase()} (${s.time}) ---\n`;
      s.duties.forEach((d) => {
        text += `• ${d.role}: ${d.assignedTo}\n`;
      });
      text += `\n`;
    });

    text += `Please check your assignments. God bless! 🙏`;
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
        <div className="text-center space-y-2 mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] tracking-wider uppercase">
            Worship Participation & Officers
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            {schedule.dateRange || "Church Worship Schedule"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Assigned roles and Worship roster for this service
          </p>
        </div>

        {activeServices.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs">
            <span className="text-3xl">🗓️</span>
            <h3 className="font-bold text-slate-800 mt-2">No Service Currently Active</h3>
            <p className="text-xs text-slate-500 mt-1">
              The church administrator has not enabled a Worship schedule for this day yet.
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${activeServices.length === 1 ? "max-w-2xl mx-auto" : "md:grid-cols-2"}`}>
            {activeServices.map((key) => {
              const item = schedule[key];
              return (
                <div
                  key={key}
                  className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="bg-slate-950 text-white px-5 py-3.5 flex justify-between items-center">
                    <h2 className="font-bold text-sm tracking-wide">{item.title}</h2>
                    <span className="text-xs text-blue-300 font-semibold">{item.time}</span>
                  </div>

                  <div className="p-5 divide-y divide-slate-100 flex-1 flex flex-col justify-around text-xs sm:text-sm">
                    {item.duties.map((Worship, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <span className="text-slate-600 font-medium">{Worship.role}</span>
                        <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200/60 text-right">
                          {Worship.assignedTo || "—"}
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
