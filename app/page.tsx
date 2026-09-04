"use client";

import { useState, useEffect, useCallback } from "react";
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

function getYouTubeEmbedUrl(url: string, autoplay = false) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}${autoplay ? "?autoplay=1" : ""}`;
  }
  return null;
}

export default function HomePage() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [nextService, setNextService] = useState<ScheduledServiceItem | null>(null);
  const [banner, setBanner] = useState("");
  
  // Expanded Modal State for viewing videos/photos in a large player without full screen
  const [activeModalItem, setActiveModalItem] = useState<ChurchEvent | null>(null);

  const syncWithAdminData = useCallback(() => {
    const savedEvents = localStorage.getItem("church_events");
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {
        setEvents([]);
      }
    } else {
      setEvents([]);
    }

    const savedBanner = localStorage.getItem("church_banner");
    setBanner(savedBanner || "");

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
        } else {
          setNextService(null);
        }
      } catch (e) {
        setNextService(null);
      }
    } else {
      setNextService(null);
    }
  }, []);

  useEffect(() => {
    syncWithAdminData();
    window.addEventListener("church_data_updated", syncWithAdminData);
    window.addEventListener("storage", syncWithAdminData);

    return () => {
      window.removeEventListener("church_data_updated", syncWithAdminData);
      window.removeEventListener("storage", syncWithAdminData);
    };
  }, [syncWithAdminData]);

  const dutyPreviewText = nextService?.duties && nextService.duties.length > 0
    ? nextService.duties
        .filter((d) => d.assignedTo)
        .slice(0, 4)
        .map((d) => `${d.role}: ${d.assignedTo}`)
        .join(" • ") || "Assignments will be posted soon."
    : "Assignments: Superintendent, Preacher, Mission Story Reader, Lesson Teachers";

  return (
    <div className="min-h-screen bg-[#f3f7fc] text-slate-800 font-sans antialiased flex flex-col relative selection:bg-blue-600 selection:text-white">
      {/* 1. TOP BANNER */}
      {banner && (
        <div className="bg-amber-400 border-b border-amber-500 text-amber-950 text-xs sm:text-sm font-bold py-2 px-4 text-center shadow-xs">
          <span className="inline-flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-950 animate-ping" />
            {banner}
          </span>
        </div>
      )}

      {/* 2. TOP NAV BAR */}
      <header className="bg-[#101828] text-white sticky top-0 z-40">
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
            <Link href="/register" className="hover:text-white transition">Membership</Link>
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

      {/* 3. HERO SECTION */}
      <section className="bg-gradient-to-b from-[#e3edf7] via-[#ebf3fb] to-[#f3f7fc] pt-14 pb-10 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-[#1e293b] tracking-tight leading-tight">
            Proclaiming the Blessed Hope, <br />
            <span className="text-[#52759f] font-extrabold">Walking in Christ Jesus.</span>
          </h1>
        </div>

        {/* 4. CENTERPIECE CARD */}
        <div className="max-w-3xl mx-auto mt-9 bg-[#111a2e] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative text-center">
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
              : "Every Saturday | 8:30 AM & 10:30 AM"}
          </p>

          <p className="text-[11px] text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed truncate">
            {dutyPreviewText}
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

        {/* 5. HOURS & LOCATION CARDS */}
        <div id="services" className="max-w-3xl mx-auto mt-4 grid sm:grid-cols-2 gap-4 text-left">
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

          <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-base shrink-0">
                📍
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-900">Sanctuary Location</h3>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Tubod, Leyte, Philippines
                </p>
              </div>
            </div>

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

      {/* 6. EVENTS & HIGHLIGHTS GRID (CLICK TO MAXIMIZE IN MODAL) */}
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
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
            No events published yet. Add an event from the Admin portal.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {events.slice(0, 8).map((ev) => {
              const photoUrl = ev.mediaUrl ? formatDriveUrl(ev.mediaUrl) : null;
              const hasVideo = Boolean(ev.videoUrl);

              return (
                <div
                  key={ev.id}
                  onClick={() => setActiveModalItem(ev)}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-500 transition group"
                >
                  {hasVideo ? (
                    <div className="h-28 bg-slate-900 text-white flex flex-col items-center justify-center p-2 relative group-hover:bg-slate-800 transition">
                      <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-xs shadow-md group-hover:scale-110 transition">
                        ▶
                      </div>
                      <span className="text-[10px] text-slate-300 font-semibold mt-1">Click to Play</span>
                    </div>
                  ) : photoUrl ? (
                    <div className="h-28 bg-slate-100 overflow-hidden relative">
                      <img src={photoUrl} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
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

      {/* 7. CINEMATIC MODAL POPUP (MAXIMIZES WHEN CLICKED, MINIMIZES WHEN CLOSED) */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{activeModalItem.date}</span>
                <h3 className="text-sm font-black truncate">{activeModalItem.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Media Body */}
            <div className="bg-black flex items-center justify-center aspect-video w-full overflow-hidden relative">
              {activeModalItem.videoUrl && getYouTubeEmbedUrl(activeModalItem.videoUrl, true) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeModalItem.videoUrl, true) || ""}
                  title={activeModalItem.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : activeModalItem.mediaUrl ? (
                <img
                  src={formatDriveUrl(activeModalItem.mediaUrl)}
                  alt={activeModalItem.title}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-slate-400 text-xs">No media preview available</div>
              )}
            </div>

            {/* Modal Description Footer */}
            <div className="p-5 bg-white space-y-3 overflow-y-auto">
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                {activeModalItem.desc}
              </p>
              {activeModalItem.videoUrl && !getYouTubeEmbedUrl(activeModalItem.videoUrl) && (
                <div className="pt-2">
                  <a
                    href={activeModalItem.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <span>🔗</span> Open external video link &rarr;
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. FOOTER */}
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
