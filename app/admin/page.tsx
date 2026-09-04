"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ScheduledServiceItem {
  id: string;
  serviceType: string;
  title: string;
  time: string;
  date: string;
  duties: { role: string; assignedTo: string }[];
}

interface ChurchEvent {
  id: number;
  title: string;
  date: string;
  desc: string;
  mediaUrl?: string;
  videoUrl?: string;
}

interface Member {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  registeredAt: string;
  department?: string;
}

const SERVICE_TEMPLATES: Record<string, { title: string; defaultTime: string; roles: string[] }> = {
  "Midweek Prayer Meeting": {
    title: "Wednesday Midweek Gathering",
    defaultTime: "Wednesday - 6:30 PM",
    roles: ["Leader / Moderator", "Devotional Speaker", "Intercessory Prayer"],
  },
  "Friday Vesper Worship": {
    title: "Friday Sunset Welcome",
    defaultTime: "Friday - 6:30 PM",
    roles: ["Song Leader", "Devotional Message", "Opening / Closing Prayer"],
  },
  "Sabbath Worship Day": {
    title: "Sabbath School & Divine Worship",
    defaultTime: "Saturday - 8:30 AM to 12:00 PM",
    roles: [
      "SS Superintendent",
      "SS Song Leader",
      "Mission Story Reader",
      "Lesson Teacher",
      "Platform Elder",
      "Divine Preacher",
      "Scripture Reading",
      "Pastoral Prayer",
      "Head Deacon",
    ],
  },
  "Adventist Youth (AY) Program": {
    title: "Saturday Afternoon Youth Fellowship",
    defaultTime: "Saturday - 3:30 PM",
    roles: ["AY Leader", "Praise Team Leader", "Special Musical Praise", "Vespers / Sunset"],
  },
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  const [schedules, setSchedules] = useState<ScheduledServiceItem[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // Form State for creating a new service
  const [chosenType, setChosenType] = useState("Midweek Prayer Meeting");
  const [serviceDate, setServiceDate] = useState("");
  const [serviceDuties, setServiceDuties] = useState<{ role: string; assignedTo: string }[]>(
    SERVICE_TEMPLATES["Midweek Prayer Meeting"].roles.map((r) => ({ role: r, assignedTo: "" }))
  );

  useEffect(() => {
    const savedSchedules = localStorage.getItem("church_multi_schedules");
    if (savedSchedules) {
      try {
        setSchedules(JSON.parse(savedSchedules));
      } catch (e) {}
    }

    const savedEvents = localStorage.getItem("church_events");
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {}
    }

    const savedMembers = localStorage.getItem("church_members");
    if (savedMembers) {
      try {
        setMembers(JSON.parse(savedMembers));
      } catch (e) {}
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "7777") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect security PIN. Access denied.");
    }
  };

  const handleTypeChange = (newType: string) => {
    setChosenType(newType);
    setServiceDuties(
      SERVICE_TEMPLATES[newType].roles.map((r) => ({ role: r, assignedTo: "" }))
    );
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceDate) {
      alert("Please choose a calendar date for this service.");
      return;
    }

    const template = SERVICE_TEMPLATES[chosenType];
    const newService: ScheduledServiceItem = {
      id: Date.now().toString(),
      serviceType: chosenType,
      title: template.title,
      time: template.defaultTime,
      date: serviceDate,
      duties: serviceDuties,
    };

    const updated = [...schedules, newService];
    // Sort so nearest is immediately recognized
    updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setSchedules(updated);
    localStorage.setItem("church_multi_schedules", JSON.stringify(updated));

    // Update banner with nearest
    const top = updated[0];
    const autoBanner = `📢 Upcoming: ${top.serviceType} | ${new Date(top.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - Duty roster active!`;
    localStorage.setItem("church_banner", autoBanner);

    alert(`${chosenType} schedule published!`);
    setServiceDate("");
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    localStorage.setItem("church_multi_schedules", JSON.stringify(updated));

    if (updated.length > 0) {
      const top = updated[0];
      const autoBanner = `📢 Upcoming: ${top.serviceType} | ${new Date(top.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      localStorage.setItem("church_banner", autoBanner);
    } else {
      localStorage.removeItem("church_banner");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full space-y-4">
          <div className="text-center">
            <span className="text-3xl">🔐</span>
            <h1 className="text-xl font-bold text-slate-900 mt-2">Tubod SDA Admin Portal</h1>
            <p className="text-xs text-slate-500">Authorized personnel only</p>
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded text-center">{error}</p>}
          <input
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            placeholder="••••"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-center tracking-[0.5em] text-2xl font-mono focus:ring-2 focus:ring-blue-700 outline-none"
          />
          <button type="submit" className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2.5 rounded-lg text-sm">
            Unlock Admin Panel
          </button>
          <div className="text-center">
            <Link href="/" className="text-xs text-slate-500 hover:underline">
              &larr; Return to Public Website
            </Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider">Admin</span>
          <h1 className="text-lg font-bold">Tubod SDA Church Manager</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/schedule" className="bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded text-xs font-semibold">
            View Public Roster &rarr;
          </Link>
          <Link href="/" className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-xs">
            Live Site
          </Link>
          <button onClick={() => setIsAuthenticated(false)} className="text-xs text-rose-400 hover:underline">
            Lock
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* 1. LIST OF SCHEDULED SERVICES */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-3 border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Active Scheduled Services ({schedules.length})</h2>
            <p className="text-xs text-slate-500">
              Arranged by nearest date. Once a service date passes, it is automatically removed from the public website.
            </p>
          </div>

          {schedules.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
              No services currently active. Schedule a Midweek or Sabbath service below.
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((s, idx) => (
                <div key={s.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded">
                      {idx === 0 ? "⚡ Nearest Upcoming" : "Queued"}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{s.serviceType}</h4>
                    <p className="text-xs text-slate-500">{s.date} • {s.time}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteSchedule(s.id)}
                    className="text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg font-semibold"
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. SCHEDULE A NEW SERVICE (MIDWEEK, SABBATH, ETC.) */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-3 border-slate-100">
            <h2 className="text-base font-bold text-slate-800">+ Schedule an Individual Service</h2>
            <p className="text-xs text-slate-500">
              Create a service with its own date. It won't overwrite your other services.
            </p>
          </div>

          <form onSubmit={handleAddSchedule} className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Type</label>
                <select
                  value={chosenType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  {Object.keys(SERVICE_TEMPLATES).map((key) => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Calendar Date *</label>
                <input
                  type="date"
                  required
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                />
              </div>
            </div>

            <div>
              <span className="block font-bold text-slate-800 mb-2 uppercase tracking-wider text-[11px]">
                Assign Officers & Duty Roles:
              </span>
              <div className="grid sm:grid-cols-2 gap-2">
                {serviceDuties.map((d, index) => (
                  <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="w-36 font-semibold text-slate-600 truncate">{d.role}</span>
                    <input
                      type="text"
                      placeholder="Assign name..."
                      value={d.assignedTo}
                      onChange={(e) => {
                        const updated = [...serviceDuties];
                        updated[index].assignedTo = e.target.value;
                        setServiceDuties(updated);
                      }}
                      className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl shadow transition"
              >
                + Publish Service Schedule
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
