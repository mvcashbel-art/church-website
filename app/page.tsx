"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ChurchEvent {
  id: number;
  title: string;
  date: string;
  desc: string;
  mediaUrl?: string;
  videoUrl?: string;
}

interface ScheduledServiceItem {
  id: string;
  serviceType: string;
  title: string;
  time: string;
  date: string;
  duties: { role: string; assignedTo: string }[];
}

function formatDriveUrl(url: string) {
  if (!url) return "";
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return url;
}

export default function ChurchBespokeHome() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [nextService, setNextService] = useState<ScheduledServiceItem | null>(null);
  const [banner, setBanner] = useState("");
  const [activeTab, setActiveTab] = useState<"services" | "events" | "roster">("services");

  useEffect(() => {
    const savedEvents = localStorage.getItem("church_events");
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {}
    }

    const savedBanner = localStorage.getItem("church_banner");
    if (savedBanner) setBanner(savedBanner);

    const savedMulti = localStorage.getItem("church_multi_schedules");
    if (savedMulti) {
      try {
        const list: ScheduledServiceItem[] = JSON.parse(savedMulti);
        const now = new Date();
        const future = list.filter((item) => {
          if (!item.date) return false;
          const end = new Date(item.date);
          end.setHours(23, 59, 59, 999);
          return now.getTime() <= end.getTime();
        });
        future.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (future.length > 0) setNextService(future[0]);
      } catch (e) {}
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 relative overflow-hidden">
      {/* AMBIENT SANCTUARY GLOWS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/15 via-indigo-500/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[600px] right-0 w-[400px] h-[400px] bg-amber-500/5 blur-[120px] pointer-events-none" />

      {/* TOP LITURGICAL TICKER */}
      {banner && (
        <div className="bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-600/30 border-b border-amber-500/30 text-amber-200 text-xs py-2 px-4 text-center font-medium backdrop-blur-md">
          <span className="inline-flex items-center gap-2 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            {banner}
          </span>
        </div>
      )}

      {/* FLOATING GLASS HEADER */}
      <header className="sticky top-4 z-50 max-w-6xl mx-auto px-4">
        <div className="bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-2xl px-5 h-16 flex items-center justify-between shadow-2xl shadow-black/60">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/20 border border-white/20">
              ✝
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white block">Tubod SDA Church</span>
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">Leyte • Sanctuary</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#sanctuary" className="hover:text-amber-300 transition-colors">Sanctuary Hours</a>
            <Link href="/schedule" className="hover:text-amber-300 transition-colors flex items-center gap-1">
              <span>📜</span> Official Roster
            </Link>
            <a href="#highlights" className="hover:text-amber-300 transition-colors">Fellowship Highlights</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/register"
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-amber-500/20 active:scale-95"
            >
              Member Portal
            </Link>
          </div>
        </div>
      </header>

      {/* BESPOKE HERO SECTION */}
      <section className="pt-24 pb-16 px-4 text-center max-w-4xl mx-auto space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Seventh-day Adventist Sanctuary Fellowship
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08]">
          Keeping the Faith, <br />
          <span className="bg-gradient-to-r from-amber-200 via-blue-200 to-indigo-300 bg-clip-text text-transparent">
            Honoring His Sabbath.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          A Bible-grounded congregation worshiping in spirit, truth, and community across Tubod, Leyte.
        </p>

        {/* HERO INTERACTION BUTTONS */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/schedule"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2 active:scale-95"
          >
            <span>📖</span> View Active Roster
          </Link>
          <a
            href="#sanctuary"
            className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-medium text-xs px-5 py-3 rounded-xl transition backdrop-blur-md"
          >
            Worship Times & Map
          </a>
        </div>
      </section>

      {/* SHOWCASE SANCTUARY SERVICE PORTAL */}
      <section className="max-w-5xl mx-auto px-4 mb-16 relative z-10">
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* SERVICE ANNOUNCER HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-md inline-block">
                Liturgical Calendar
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {nextService ? nextService.serviceType : "Sabbath School & Divine Service"}
              </h2>
              <p className="text-xs text-slate-400">
                {nextService?.date ? new Date(nextService.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "This Sabbath"} • {nextService?.time || "8:30 AM & 10:30 AM"}
              </p>
            </div>

            <Link
              href="/schedule"
              className="bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition text-center shrink-0"
            >
              Open Printable Board &rarr;
            </Link>
          </div>

          {/* REALTIME ROSTER BADGE GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(nextService?.duties && nextService.duties.length > 0
              ? nextService.duties
              : [
                  { role: "Platform Elder", assignedTo: "Church Officer" },
                  { role: "Divine Preacher", assignedTo: "Pastor / Elder" },
                  { role: "SS Superintendent", assignedTo: "Leader" },
                  { role: "Lesson Study Teacher", assignedTo: "Appointed Elder" },
                ]
            ).slice(0, 8).map((d, idx) => (
              <div
                key={idx}
                className="bg-white/[0.03] border border-white/[0.06] hover:border-blue-500/40 p-3 rounded-2xl transition duration-200"
              >
                <span className="text-[10px] font-semibold text-slate-400 block truncate">{d.role}</span>
                <span className="text-xs font-bold text-white mt-1 block truncate">
                  {d.assignedTo || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BESPOKE WORSHIP GATHERINGS & DIRECTIONS */}
      <section id="sanctuary" className="max-w-5xl mx-auto px-4 mb-20 space-y-6">
        <div className="grid sm:grid-cols-2 gap-5">
          {/* APPOINTED GATHERING TIMES */}
          <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                  ⌛
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Sanctuary Schedule</h3>
                  <p className="text-xs text-slate-400">Recurring meeting times</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.02]">
                  <span className="text-slate-400">Sabbath Morning Bible Study</span>
                  <span className="font-bold text-white">Saturday 8:30 AM</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-blue-300 font-semibold">Divine Worship Hour</span>
                  <span className="font-black text-amber-300">Saturday 10:30 AM</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.02]">
                  <span className="text-slate-400">Adventist Youth (AY)</span>
                  <span className="font-bold text-white">Saturday 3:30 PM</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.02]">
                  <span className="text-slate-400">Midweek Prayer Gathering</span>
                  <span className="font-bold text-white">Wednesday 6:30 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* SANCTUARY LOCATION CARD */}
          <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  📍
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Sanctuary Location</h3>
                  <p className="text-xs text-slate-400">Tubod, Leyte, Philippines</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/[0.04]">
                Our sanctuary gates welcome everyone—visitors, traveling members, and families looking for peace, truth, and community fellowship.
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <a
                href="https://maps.google.com/?q=Tubod+Seventh-day+Adventist+Church+Leyte"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1.5"
              >
                <span>🗺️</span> Open Google Maps &rarr;
              </a>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                Open Every Sabbath
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* BESPOKE EVENTS & MEDIA HIGHLIGHTS */}
      <section id="highlights" className="max-w-6xl mx-auto px-4 mb-24">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-widest">Congregation Memories</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Events & Photo Gallery</h2>
          </div>
          <Link href="/admin" className="text-xs text-slate-400 hover:text-white transition">
            Admin Portal &rarr;
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="p-12 text-center bg-white/[0.02] border border-white/5 rounded-3xl text-xs text-slate-500">
            No memories posted currently. Add event photo or video links inside Admin.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden hover:border-amber-400/40 transition duration-300 flex flex-col justify-between group"
              >
                {ev.mediaUrl ? (
                  <div className="h-48 overflow-hidden bg-black/40">
                    <img
                      src={formatDriveUrl(ev.mediaUrl)}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-slate-950 to-blue-950 flex items-center justify-center text-slate-600 text-xs">
                    Tubod SDA Sanctuary
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{ev.date}</span>
                    <h4 className="text-sm font-bold text-white mt-1 group-hover:text-amber-200 transition-colors">
                      {ev.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{ev.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black/50 py-10 px-4 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Tubod Seventh-day Adventist Church • Leyte, Philippines</p>
        <div className="mt-3 flex justify-center gap-4 text-[11px]">
          <Link href="/schedule" className="hover:text-slate-300">Worship Roster</Link>
          <span>•</span>
          <Link href="/register" className="hover:text-slate-300">Member Registry</Link>
          <span>•</span>
          <Link href="/admin" className="text-slate-600 hover:text-slate-400">Admin Portal</Link>
        </div>
      </footer>
    </div>
  );
}
