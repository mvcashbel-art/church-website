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
  dateRange: "This Week's Services",
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
    enabled: true,
    duties: [
      { role: "Song Leader", assignedTo: "Music Ministry" },
      { role: "Devotional Message", assignedTo: "Assigned Speaker" },
      { role: "Opening / Closing Prayer", assignedTo: "Assigned Member" },
    ],
  },
  sabbathSchool: {
    title: "Sabbath School",
    time: "Saturday - 8:30 AM",
    enabled: true,
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
    enabled: true,
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
    enabled: true,
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
        setSchedule(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Filter only enabled/visible services
  const visibleServices = (
    [
      schedule.midweek,
      schedule.vespers,
      schedule.sabbathSchool,
      schedule.divineWorship,
      schedule.ay,
    ] as ServiceSchedule[]
  ).filter((s) => s.enabled !== false);

  const copyToMessenger = () => {
    const formatSection = (sec: ServiceSchedule) => {
      const list = sec.duties.map((d) => `• ${d.role}: ${d.assignedTo}`).join("\n");
      return `📌 *${sec.title}* (${sec.time})\n${list}`;
    };

    const text = `⛪ *TUBOD SDA CHURCH - Worship Schedule*\n🗓️ ${schedule.dateRange}\n\n` +
      visibleServices.map(formatSection).join("\n\n") +
      `\n\n"Whatever your hand finds to do, do it with all your might." - Ecclesiastes 9:10`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-base sm:text-lg font-extrabold text-blue-800 tracking-tight">
            Tubod Seventh-day Adventist Church
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={copyToMessenger}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {copied ? "✓ Copied to Clipboard!" : "📋 Copy for Messenger"}
            </button>
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-blue-800"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 w-full flex-1">
        <div className="text-center mb-8 space-y-2">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Worship Participation & Officers
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Church Worship Schedule
          </h1>
          <p className="text-sm font-semibold text-slate-500">{schedule.dateRange}</p>
        </div>

        {visibleServices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
            <p className="text-slate-500 font-medium">No Worship schedules are currently published for this period.</p>
            <p className="text-xs text-slate-400 mt-1">Check back soon or ask your church elders for assignments.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {visibleServices.map((srv, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
                  <h2 className="font-bold text-sm tracking-wide">{srv.title}</h2>
                  <span className="text-xs text-blue-300">{srv.time}</span>
                </div>
                <div className="p-5 divide-y divide-slate-100 flex-1">
                  {srv.duties.map((Worship, dIdx) => (
                    <div key={dIdx} className="py-2.5 flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-slate-600 font-medium">{Worship.role}</span>
                      <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md text-right">
                        {Worship.assignedTo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-xs text-slate-500">
          Scheduled participants unable to fulfill their Worship are requested to inform the head deacon or elder in advance.
        </div>
      </main>

      <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Tubod Seventh-day Adventist Church</p>
      </footer>
    </div>
  );
}