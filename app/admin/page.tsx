"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export interface ScheduledServiceItem {
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
  photoUrl?: string;
  status?: "pending" | "approved";
}

const SERVICE_TEMPLATES: Record<string, { title: string; defaultTime: string; roles: string[] }> = {
  "Sabbath School": {
    title: "Sabbath Morning Bible Study & Lesson",
    defaultTime: "Saturday - 8:30 AM",
    roles: [
      "Superintendent",
      "Song Leader / Chorister",
      "Pianist / Organist",
      "Mission Story Reader",
      "Opening Prayer",
      "Lesson Study Teacher",
    ],
  },
  "Divine Worship Service": {
    title: "Main Sabbath Divine Worship Service",
    defaultTime: "Saturday - 10:30 AM",
    roles: [
      "Platform Elder",
      "Preacher / Speaker",
      "Scripture Reading",
      "Pastoral / Intercessory Prayer",
      "Tithe & Offertory Leader",
      "Head Deacon",
      "Head Deaconess",
    ],
  },
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
  "Adventist Youth (AY) Program": {
    title: "Saturday Afternoon Youth Fellowship",
    defaultTime: "Saturday - 3:30 PM",
    roles: ["AY Leader", "Praise Team Leader", "Special Musical Praise", "Vespers / Sunset"],
  },
};

const DEPARTMENTS = [
  "Regular Church Member",
  "Visitor / Guest",
  "Youth (AY / Adventist Youth)",
  "Sabbath School",
  "Personal Ministries",
  "Deacon / Deaconess",
  "Adventurers / Pathfinders",
  "Music & Choir",
  "Health Ministries",
  "Communications & Media",
  "Church Elder / Board",
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  const [schedules, setSchedules] = useState<ScheduledServiceItem[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [bannerNotice, setBannerNotice] = useState("");

  // Create schedule form state
  const [chosenType, setChosenType] = useState("Sabbath School");
  const [serviceDate, setServiceDate] = useState("");
  const [serviceDuties, setServiceDuties] = useState<{ role: string; assignedTo: string }[]>(
    SERVICE_TEMPLATES["Sabbath School"].roles.map((r) => ({ role: r, assignedTo: "" }))
  );

  // Event form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    let combinedList: ScheduledServiceItem[] = [];

    const savedSchedules = localStorage.getItem("church_multi_schedules");
    if (savedSchedules) {
      try {
        combinedList = JSON.parse(savedSchedules);
      } catch (e) {}
    }

    const savedLegacy = localStorage.getItem("church_duty_schedule");
    if (savedLegacy) {
      try {
        const leg = JSON.parse(savedLegacy);
        const legacyKeys = ["midweek", "vespers", "sabbathSchool", "divineWorship", "ay"] as const;
        const legacyDate = leg.dateRange?.includes("|") ? leg.dateRange.split("|")[1].trim() : "2026-09-09";

        legacyKeys.forEach((k) => {
          if (leg[k]?.enabled) {
            if (!combinedList.some((item) => item.serviceType === leg[k].title)) {
              combinedList.push({
                id: `legacy-${k}-${Date.now()}`,
                serviceType: leg[k].title,
                title: leg[k].title,
                time: leg[k].time,
                date: legacyDate,
                duties: leg[k].duties || [],
              });
            }
          }
        });
        localStorage.removeItem("church_duty_schedule");
        localStorage.setItem("church_multi_schedules", JSON.stringify(combinedList));
      } catch (e) {}
    }

    combinedList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setSchedules(combinedList);

    const savedEvents = localStorage.getItem("church_events");
    if (savedEvents !== null) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {}
    }

    const savedMembers = localStorage.getItem("church_members");
    if (savedMembers) {
      try {
        const parsed: Member[] = JSON.parse(savedMembers);
        // Ensure any pre-existing legacy members default to approved
        const normalized = parsed.map((m) => ({ ...m, status: m.status || "approved" }));
        setMembers(normalized);
      } catch (e) {}
    }

    const savedBanner = localStorage.getItem("church_banner");
    if (savedBanner) setBannerNotice(savedBanner);
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
      alert("Please select a date for this service.");
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
    updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setSchedules(updated);
    localStorage.setItem("church_multi_schedules", JSON.stringify(updated));

    const top = updated[0];
    const autoBanner = `📢 Upcoming: ${top.serviceType} | ${new Date(top.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - Please check the Worship roster for your assignments!`;
    localStorage.setItem("church_banner", autoBanner);
    setBannerNotice(autoBanner);

    alert(`${chosenType} published!`);
    setServiceDate("");
  };

  const handleDeleteSchedule = (id: string) => {
    if (!confirm("Are you sure you want to delete this worship schedule?")) return;
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    localStorage.setItem("church_multi_schedules", JSON.stringify(updated));

    if (updated.length > 0) {
      const top = updated[0];
      const autoBanner = `📢 Upcoming: ${top.serviceType} | ${new Date(top.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - Please check the Worship roster for your assignments!`;
      localStorage.setItem("church_banner", autoBanner);
      setBannerNotice(autoBanner);
    } else {
      localStorage.removeItem("church_banner");
      setBannerNotice("");
    }
  };

  const handleUpdateAssignedDuty = (scheduleId: string, dutyIdx: number, val: string) => {
    const updated = schedules.map((item) => {
      if (item.id === scheduleId) {
        const nextDuties = [...item.duties];
        nextDuties[dutyIdx].assignedTo = val;
        return { ...item, duties: nextDuties };
      }
      return item;
    });
    setSchedules(updated);
    localStorage.setItem("church_multi_schedules", JSON.stringify(updated));
  };

  const handleWipeAllSchedules = () => {
    if (confirm("Delete ALL active schedules and alerts? This clears the entire schedule page.")) {
      setSchedules([]);
      localStorage.removeItem("church_multi_schedules");
      localStorage.removeItem("church_duty_schedule");
      localStorage.removeItem("church_banner");
      setBannerNotice("");
      alert("All schedules wiped clean.");
    }
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDesc) return;

    const newEvent: ChurchEvent = {
      id: Date.now(),
      title: eventTitle,
      date: eventDate || "Upcoming",
      desc: eventDesc,
      mediaUrl: mediaUrl.trim(),
      videoUrl: videoUrl.trim(),
    };

    const updated = [newEvent, ...events];
    setEvents(updated);
    localStorage.setItem("church_events", JSON.stringify(updated));

    setEventTitle("");
    setEventDate("");
    setEventDesc("");
    setMediaUrl("");
    setVideoUrl("");
    alert("Event published successfully!");
  };

  const handleDeleteEvent = (id: number) => {
    const updated = events.filter((item) => item.id !== id);
    setEvents(updated);
    localStorage.setItem("church_events", JSON.stringify(updated));
  };

  // Member Approval & Directory Handlers
  const handleApproveMember = (id: number) => {
    const updated = members.map((m) => (m.id === id ? { ...m, status: "approved" as const } : m));
    setMembers(updated);
    localStorage.setItem("church_members", JSON.stringify(updated));
  };

  const handleDeclineMember = (id: number) => {
    if (confirm("Decline and remove this applicant?")) {
      const updated = members.filter((m) => m.id !== id);
      setMembers(updated);
      localStorage.setItem("church_members", JSON.stringify(updated));
    }
  };

  const handleDepartmentChange = (memberId: number, newDept: string) => {
    const updated = members.map((m) => (m.id === memberId ? { ...m, department: newDept } : m));
    setMembers(updated);
    localStorage.setItem("church_members", JSON.stringify(updated));
  };

  const handleDeleteMember = (id: number) => {
    if (confirm("Remove this member from directory?")) {
      const updated = members.filter((m) => m.id !== id);
      setMembers(updated);
      localStorage.setItem("church_members", JSON.stringify(updated));
    }
  };

  const handleUpdateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("church_banner", bannerNotice);
    alert("Banner updated!");
  };

  const pendingMembers = members.filter((m) => m.status === "pending");
  const approvedMembers = members.filter((m) => m.status !== "pending");

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
        {/* 1. MANAGE & EDIT ACTIVE SCHEDULES */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">Manage & Edit Active Schedules ({schedules.length})</h2>
              <p className="text-xs text-slate-500">
                Edit member assignments directly or delete any service. Nearest date appears at the top.
              </p>
            </div>
            {schedules.length > 0 && (
              <button
                type="button"
                onClick={handleWipeAllSchedules}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                Clear All Schedules
              </button>
            )}
          </div>

          {schedules.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
              No services currently active. Schedule a service below.
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((s, idx) => (
                <div key={s.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                    <div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        idx === 0 ? "bg-amber-300 text-amber-950 font-black" : "bg-blue-100 text-blue-800"
                      }`}>
                        {idx === 0 ? "⚡ Nearest Upcoming (On Top)" : "Queued"}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{s.serviceType}</h4>
                      <p className="text-xs text-slate-500">{s.date} • {s.time}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteSchedule(s.id)}
                      className="text-xs text-rose-600 hover:bg-rose-100 bg-white border border-rose-300 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
                    >
                      <span>🗑️</span> Delete Service
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    {s.duties.map((duty, dIdx) => (
                      <div key={dIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <span className="w-40 font-semibold text-slate-600 truncate">{duty.role}</span>
                        <input
                          type="text"
                          placeholder="Type assigned name..."
                          value={duty.assignedTo}
                          onChange={(e) => handleUpdateAssignedDuty(s.id, dIdx, e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. SCHEDULE AN INDIVIDUAL SERVICE FORM */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-3 border-slate-100">
            <h2 className="text-base font-bold text-slate-800">+ Schedule a New Service</h2>
            <p className="text-xs text-slate-500">
              Pick Sabbath School, Divine Worship, or Midweek, pick the date, and assign officers.
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
                    <span className="w-44 font-semibold text-slate-600 truncate">{d.role}</span>
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

        {/* 3. MANAGE & DELETE EXISTING EVENTS / HIGHLIGHTS */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b pb-3 border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Manage Active Events & Highlights ({events.length})</h2>
            <p className="text-xs text-slate-500">Events currently showing in the public "Events & Highlights" section.</p>
          </div>

          {events.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs text-slate-500 font-medium">All events have been deleted. Nothing is displayed on the homepage.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((ev) => (
                <div key={ev.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col justify-between shadow-xs">
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">{ev.date}</span>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">{ev.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{ev.desc}</p>
                      {ev.mediaUrl && <p className="text-[10px] text-slate-400 truncate mt-1">📷 {ev.mediaUrl}</p>}
                      {ev.videoUrl && <p className="text-[10px] text-blue-600 truncate mt-0.5">🎥 {ev.videoUrl}</p>}
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>🗑️</span> Delete Event
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. POST EVENT WITH GOOGLE DRIVE PHOTO / YOUTUBE VIDEO */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">+ Add Event / Video Highlight</h2>
            <p className="text-xs text-slate-500">
              Paste a Google Drive image link or a YouTube/Facebook video link. Saves hosting space.
            </p>
          </div>

          <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Event Title *</label>
              <input
                type="text"
                required
                placeholder="Youth Fellowship & Music"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-700 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date & Time</label>
              <input
                type="text"
                placeholder="Saturday - 3:30 PM"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-700 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Google Drive Photo Link <span className="font-normal text-slate-400">("Anyone with link" view)</span>
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-700 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                YouTube or Facebook Video Link
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://fb.watch/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-700 outline-none text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Details & Description *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe the sermon, praise ministry, or gathering..."
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-700 outline-none text-xs"
              />
            </div>

            <div>
              <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2 rounded-lg text-xs shadow">
                + Publish Highlight
              </button>
            </div>
          </form>
        </section>

        {/* 5. TOP ALERT BANNER */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800">Live Top Alert Announcement Banner</h2>
            <span className="text-xs text-slate-400">Shows across every page</span>
          </div>
          <form onSubmit={handleUpdateBanner} className="flex gap-3">
            <input
              type="text"
              value={bannerNotice}
              onChange={(e) => setBannerNotice(e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-700 outline-none"
            />
            <button type="submit" className="bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold px-4 py-2 rounded-lg">
              Save Banner
            </button>
          </form>
        </section>

        {/* 6. PENDING APPROVAL QUEUE (NEW MEMBERS TO REVIEW) */}
        <section className="bg-amber-50/70 border border-amber-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-amber-200/80">
            <div>
              <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
                <span>⏳</span> Pending Member Registrations ({pendingMembers.length})
              </h2>
              <p className="text-xs text-amber-800">
                Review submitted profiles. Approved members appear in the official directory.
              </p>
            </div>
            {pendingMembers.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full animate-pulse">
                Action Required
              </span>
            )}
          </div>

          {pendingMembers.length === 0 ? (
            <div className="p-6 text-center bg-white/70 border border-dashed border-amber-300 rounded-xl text-xs text-amber-800">
              ✓ No pending registrations. All applicants have been reviewed.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {pendingMembers.map((m) => (
                <div key={m.id} className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                      {m.photoUrl ? (
                        <img src={m.photoUrl} alt={m.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-base text-slate-400 font-bold">
                          {m.fullName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{m.fullName}</h4>
                      <p className="text-xs text-slate-600">{m.phone}</p>
                      <p className="text-[11px] text-slate-500 truncate">{m.address || "No address provided"}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {m.department || "Regular Member"}
                        </span>
                        <span className="text-[10px] text-slate-400">Applied {m.registeredAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleDeclineMember(m.id)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-rose-200 transition"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleApproveMember(m.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-xs transition"
                    >
                      ✓ Approve Member
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 7. APPROVED CHURCH DIRECTORY */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Approved Church Directory ({approvedMembers.length})</h2>
            <p className="text-xs text-slate-500">Official church members with assigned roles.</p>
          </div>

          {approvedMembers.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No approved members yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Member</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Address</th>
                    <th className="p-3">Ministry Role</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approvedMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                            {m.photoUrl ? (
                              <img src={m.photoUrl} alt={m.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm text-slate-500 font-bold">
                                {m.fullName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{m.fullName}</div>
                            <div className="text-[10px] text-slate-400">Joined {m.registeredAt}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-medium">{m.phone}</td>
                      <td className="p-3">{m.address || "—"}</td>
                      <td className="p-3">
                        <select
                          value={m.department || "Regular Church Member"}
                          onChange={(e) => handleDepartmentChange(m.id, e.target.value)}
                          className="bg-white border border-slate-300 text-slate-800 text-xs rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-600 outline-none font-medium"
                        >
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteMember(m.id)}
                          className="text-rose-600 hover:underline font-semibold"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
