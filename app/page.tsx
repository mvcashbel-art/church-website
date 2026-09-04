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

function getYouTubeEmbedUrl(url: string) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return null;
}

export default function HomePage() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [nextService, setNextService] = useState<ScheduledServiceItem | null>(null);

  useEffect(() => {
    // 1. Load Events
    const savedEvents = localStorage.getItem("church_events");
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {}
    }

    // 2. Load Nearest Scheduled Service
    const savedSchedules = localStorage.getItem("church_multi_schedules");
    if (savedSchedules) {
      try {
        const list: ScheduledServiceItem[] = JSON.parse(savedSchedules);
        const now = new Date();
        const future = list.filter((s) => {
          if (!s.date) return false;
          const end = new Date(s.date);
          end.setHours(23, 59, 59, 999);
          return now.getTime() <= end.getTime();
        });
        future.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (future.length > 0) {
          setNextService(future[0]);
        }
      } catch (e) {}
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f7fc] text-slate-800 font-sans antialiased flex flex-col">
      {/* 1. TOP NAV BAR (DARK SLATE AS SEEN IN IMAGE) */}
      <header className="bg-[#101828] text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-200 text-sm font-serif">
              ✝
            </div>
            <div className="text-xs sm:text-sm font-semibold tracking-tight text-slate-100">
              Tubod Seventh-day Adventist Church
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-normal text-slate-300">
            <a href="#services" className="hover:text-white transition">Services</a>
            <Link href="/schedule" className="hover:text-white transition">Worship Schedule</Link>
            <a href="#highlights" className="hover:text-white transition">Events & Highlights</a>
            <a href="#community" className="hover:text-white transition">Membership</a>
          </nav>

          <div>
            <Link
              href="/register"
              className="bg-[#2463eb] hover:bg-blue-600 text-white text-xs font-medium px-4 py-1.5 rounded-md transition shadow-xs"
            >
              Member Portal
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="bg-gradient-to-b from-[#e3edf7] via-[#ebf3fb] to-[#f3f7fc] pt-14 pb-10 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-[#1e293b] tracking-tight leading-tight">
            Proclaiming the Blessed Hope, <br />
            <span className="text-[#52759f] font-extrabold">Walking in Christ Jesus.</span>
          </h1>
        </div>

        {/* 3. CENTERPIECE CARD: NEXT UPCOMING WORSHIP SERVICE */}
        <div className="max-w-3xl mx-auto mt-9 bg-[#111a2e] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative text-center">
          {/* Tag on top-left of card */}
          <div className="sm:absolute sm:top-5 sm:left-6 mb-3 sm:mb-0 inline-flex items-center gap-1.5 bg-[#1e2e4f] text-blue-300 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
            <span>🗓️</span> NEXT SERVICE
          </div>

          <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase block sm:mt-1">
            Next Upcoming Worship Service
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            {nextService ? nextService.serviceType : "Sabbath School & Divine Worship"}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {nextService?.date
              ? `${new Date(nextService.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} | ${nextService.time}`
              : "September 12, 2026 | 8:30 AM"}
          </p>

          <p className="text-[11px] text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
            Assignments: Superintendent, Preacher, Mission Story Reader, Lesson Teachers
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
            <Link
              href="/schedule"
              className="bg-[#1e293b] hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-md transition border border-slate-700"
            >
              View Full Schedule
            </Link>
            <Link
              href="/register"
              className="bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold px-4 py-2 rounded-md transition shadow-xs"
            >
              Register for Service
            </Link>
          </div>
        </div>

        {/* 4. TWO-COLUMN SCHEDULE & LOCATION CARDS */}
        <div className="max-w-3xl mx-auto mt-4 grid sm:grid-cols-2 gap-4 text-left">
          {/* Card 1: Sabbath Gathering Hours */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-base shrink-0">
              🕒
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-900">Sabbath Gathering Hours</h3>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                8:30 AM - 12:00 PM, 3:30 PM
              </p>
            </div>
          </div>

          {/* Card 2: Sanctuary Location */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-base shrink-0">
                📍
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-900">Sanctuary Location</h3>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  433 Google Map, Tubod Se...
                </p>
              </div>
            </div>

            {/* Simulated mini Google Map badge */}
            <a
              href="https://maps.google.com/?q=Tubod+Seventh-day+Adventist+Church+Leyte"
              target="_blank"
              rel="noreferrer"
              className="bg-blue-50 border border-blue-100 hover:bg-blue-100 text-[10px] font-semibold text-blue-700 px-2 py-1 rounded transition shrink-0 ml-2"
            >
              Google Map &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* 5. EVENTS & HIGHLIGHTS GRID (4-CARD LAYOUT) */}
      <section id="highlights" className="max-w-4xl mx-auto w-full px-4 pt-6 pb-16">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-700">
            EVENTS & HIGHLIGHTS
          </span>
          <Link href="/admin" className="text-[11px] font-semibold text-blue-600 hover:underline">
            Manage &rarr;
          </Link>
        </div>

        {events.length === 0 ? (
          /* Default mock previews matching the visual layout if nothing is added yet */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Card 1: Community Service Day */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
              <div className="h-28 bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                📸 Group Photo
              </div>
              <div className="p-2.5">
                <span className="text-[9px] text-slate-400 block">September 12, 2026</span>
                <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">Community Service Day</h4>
              </div>
            </div>

            {/* Card 2: Youth Gathering */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
              <div className="h-28 bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                📸 Youth Photo
              </div>
              <div className="p-2.5">
                <span className="text-[9px] text-slate-400 block">September 12, 2026</span>
                <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">Youth Gathering</h4>
              </div>
            </div>

            {/* Card 3: Recent Sermon (YouTube Video Card) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
              <div className="h-28 bg-slate-900 text-white flex flex-col items-center justify-center relative p-2">
                <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-xs">
                  ▶
                </div>
                <span className="absolute bottom-1.5 right-2 text-[9px] font-bold text-white flex items-center gap-0.5">
                  YouTube
                </span>
              </div>
              <div className="p-2.5">
                <span className="text-[9px] text-rose-600 font-semibold block flex items-center gap-1">
                  ▶ YouTube
                </span>
                <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">Recent Sermon</h4>
              </div>
            </div>

            {/* Card 4: Pathfinder Trip (Facebook Video Card) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
              <div className="h-28 bg-[#1877f2]/90 text-white flex flex-col items-center justify-center relative p-2">
                <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-xs">
                  ▶
                </div>
                <span className="absolute bottom-1.5 right-2 text-[9px] font-bold text-white">
                  Facebook
                </span>
              </div>
              <div className="p-2.5">
                <span className="text-[9px] text-blue-600 font-semibold block flex items-center gap-1">
                  f Facebook
                </span>
                <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">Pathfinder Trip</h4>
              </div>
            </div>
          </div>
        ) : (
          /* Live user-created events from admin */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {events.slice(0, 4).map((ev) => {
              const ytEmbed = ev.videoUrl ? getYouTubeEmbedUrl(ev.videoUrl) : null;
              const photoUrl = ev.mediaUrl ? formatDriveUrl(ev.mediaUrl) : null;

              return (
                <div
                  key={ev.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  {ytEmbed ? (
                    <div className="h-28 bg-black">
                      <iframe
                        src={ytEmbed}
                        title={ev.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : photoUrl ? (
                    <div className="h-28 bg-slate-100 overflow-hidden">
                      <img src={photoUrl} alt={ev.title} className="w-full h-full object-cover" />
                    </div>
                  ) : ev.videoUrl ? (
                    <div className="h-28 bg-slate-900 text-white flex flex-col items-center justify-center p-2 relative">
                      <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-xs">
                        ▶
                      </div>
                      <a
                        href={ev.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-blue-300 underline mt-1 truncate max-w-full px-2"
                      >
                        Watch Video &rarr;
                      </a>
                    </div>
                  ) : (
                    <div className="h-28 bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-medium">
                      Tubod SDA
                    </div>
                  )}

                  <div className="p-2.5">
                    <span className="text-[9px] text-slate-400 block">{ev.date}</span>
                    <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{ev.title}</h4>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. FOOTER */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Tubod Seventh-day Adventist Church. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4 text-[11px]">
          <Link href="/schedule" className="hover:text-blue-600 transition">Schedule</Link>
          <span>•</span>
          <Link href="/register" className="hover:text-blue-600 transition">Register</Link>
          <span>•</span>
          <Link href="/admin" className="text-slate-400 hover:text-slate-600 transition">Admin</Link>
        </div>
      </footer>
    </div>
  );
}
