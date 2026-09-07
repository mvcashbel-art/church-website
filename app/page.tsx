"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface ChurchEvent {
  id: number;
  title: string;
  date: string;
  desc: string;
  image?: string;
}

const DEFAULT_EVENTS: ChurchEvent[] = [
  {
    id: 1,
    title: "Sabbath School & Divine Worship",
    date: "Every Saturday - 8:30 AM",
    desc: "Join us for morning worship, lesson study, and fellowship luncheon.",
  },
  {
    id: 2,
    title: "Adventist Youth (AY) Fellowship",
    date: "Saturday - 3:30 PM",
    desc: "Praise music, discussions, and spiritual activities for youth of all ages.",
  }
];

export default function ChurchHome() {
  const [events, setEvents] = useState<ChurchEvent[]>(DEFAULT_EVENTS);
  const [banner, setBanner] = useState("📢 Happy Preparation Day! Sabbath worship begins tomorrow at 8:30 AM.");

  useEffect(() => {
    async function fetchHomeCloudData() {
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .order("id", { ascending: false });

      if (!eventsError && eventsData && eventsData.length > 0) {
        setEvents(eventsData);
      }

      const { data: bannerData, error: bannerError } = await supabase
        .from("banner")
        .select("*")
        .limit(1)
        .single();

      if (!bannerError && bannerData && bannerData.text) {
        setBanner(bannerData.text);
      }
    }

    fetchHomeCloudData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-200 selection:text-blue-900">
      <div className="bg-amber-400 border-b border-amber-500 text-amber-950 text-xs sm:text-sm font-bold py-2.5 px-4 text-center shadow-xs">
        <span className="inline-flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-950 animate-pulse"></span>
          {banner}
        </span>
      </div>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-blue-500/20">
              ✝
            </div>
            <div>
              <span className="block text-base sm:text-lg font-bold tracking-tight text-slate-900">
                Tubod Seventh-day Adventist
              </span>
              <span className="block text-[11px] font-semibold text-blue-600 tracking-wider uppercase">
                Leyte, Philippines
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#services" className="hover:text-blue-600 transition-colors">Services</a>
            <Link href="/schedule" className="text-blue-600 hover:text-blue-700 transition-colors font-semibold flex items-center gap-1.5">
              <span>📋</span> Duty Roster
            </Link>
            <a href="#events" className="hover:text-blue-600 transition-colors">Events & Photos</a>
            <a href="#community" className="hover:text-blue-600 transition-colors">Membership</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-blue-600/20 active:scale-95"
            >
              Member Portal
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden pt-16 pb-24 px-4 text-center bg-gradient-to-b from-blue-100/60 via-blue-50/40 to-slate-50">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-blue-200 bg-white text-blue-700 text-xs font-semibold shadow-xs">
            <span>✨</span> Welcome to Our Sanctuary & Online Fellowship
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Proclaiming the Blessed Hope, <br className="hidden sm:inline" />
            <span className="text-blue-600">
              Walking in Christ Jesus.
            </span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            A Bible-believing family committed to Sabbath worship, Gospel truth, Christian fellowship, and loving service across Tubod.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <Link
              href="/schedule"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              <span>📋</span> View Weekly Worship Schedule
            </Link>
            <a
              href="#services"
              className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-xs"
            >
              Worship Hours
            </a>
          </div>
        </div>
      </section>

      <section id="services" className="py-8 px-4 max-w-6xl mx-auto w-full -mt-10 relative z-20">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200/80 p-7 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <span className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 text-xl">
                ⏳
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Sabbath Gathering Hours</h2>
                <p className="text-xs text-slate-500">Regular weekly service appointments</p>
              </div>
            </div>
            <div className="space-y-3 text-sm divide-y divide-slate-100">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500 font-medium">Sabbath School</span>
                <span className="font-semibold text-slate-800">Saturday 8:30 AM</span>
              </div>
              <div className="pt-3 flex justify-between">
                <span className="text-slate-500 font-medium">Divine Worship</span>
                <span className="font-bold text-blue-600">Saturday 10:30 AM</span>
              </div>
              <div className="pt-3 flex justify-between">
                <span className="text-slate-500 font-medium">Adventist Youth (AY)</span>
                <span className="font-semibold text-slate-800">Saturday 3:30 PM</span>
              </div>
              <div className="pt-3 flex justify-between">
                <span className="text-slate-500 font-medium">Midweek Prayer</span>
                <span className="font-semibold text-slate-800">Wednesday 6:30 PM</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-7 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 text-xl">
                  📍
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Sanctuary Location</h2>
                  <p className="text-xs text-slate-500">Gather with us in fellowship</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Tubod Seventh-day Adventist Church Sanctuary, Tubod, Leyte, Philippines. All guests, visitors, and members are warmly welcome.
              </p>
            </div>
            <div className="pt-5 border-t border-slate-100">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors">
                Open Directions in Google Maps &rarr;
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="events" className="py-12 px-4 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3 border-b border-slate-200/80 pb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Memories & Gatherings</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Events & Highlights</h2>
          </div>
          <Link href="/admin" className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
            Upload Event &rarr;
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              {ev.image ? (
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={ev.image}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="h-40 bg-blue-50/50 flex items-center justify-center text-blue-400 text-xs font-medium">
                  Tubod SDA Sanctuary
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-600 tracking-wide uppercase">{ev.date}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{ev.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="community" className="py-14 px-4 bg-white border-y border-slate-200/80 my-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-block p-3 rounded-2xl bg-blue-50 text-blue-600 text-2xl">
            👥
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Join the Church Fellowship Directory</h2>
          <p className="text-slate-600 text-sm max-w-lg mx-auto">
            Are you regularly attending or part of the Tubod congregation? Keep connected with weekly service rosters and updates.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all inline-block shadow-sm hover:shadow-md hover:shadow-blue-600/20"
            >
              Register Membership &rarr;
            </Link>
          </div>
        </div>
      </section>

      <footer className="mt-auto bg-white border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Tubod Seventh-day Adventist Church. All rights reserved.</p>
        <div className="mt-3 flex justify-center gap-4 text-[11px]">
          <Link href="/schedule" className="text-slate-600 hover:text-blue-600 transition-colors">
            Duty Roster
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="/register" className="text-slate-600 hover:text-blue-600 transition-colors">
            Member Register
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="/admin" className="text-slate-400 hover:text-slate-600 transition-colors">
            Admin Portal
          </Link>
        </div>
      </footer>
    </div>
  );
}