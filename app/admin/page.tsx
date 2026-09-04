"use client";

import { useState, useEffect, ChangeEvent } from "react";
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
  mediaUrl?: string; // Can be a local compressed base64 or Google Drive link
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

function broadcastDataChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("church_data_updated"));
  }
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
  const [activeTab, setActiveTab] = useState<"schedules" | "events" | "members" | "banner">("events");

  const [schedules, setSchedules] = useState<ScheduledServiceItem[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [bannerNotice, setBannerNotice] = useState("");

  // Schedule form state
  const [chosenType, setChosenType] = useState("Sabbath School");
  const [serviceDate, setServiceDate] = useState("");
  const [serviceDuties, setServiceDuties] = useState<{ role: string; assignedTo: string }[]>(
    SERVICE_TEMPLATES["Sabbath School"].roles.map((r) => ({ role: r, assignedTo: "" }))
  );

  // Event form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [mediaUrl, setMediaUrl] = useState(""); // Google Drive link fallback
  const [videoUrl, setVideoUrl] = useState("");
  const [eventPhotoPreview, setEventPhotoPreview] = useState(""); // Local uploaded photo

  useEffect(() => {
    let combinedList: ScheduledServiceItem[] = [];
    const savedSchedules = localStorage.getItem("church_multi_schedules");
    if (savedSchedules) {
      try {
        combinedList = JSON.parse(savedSchedules);
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
        setMembers(parsed.map((m) => ({ ...m, status: m.status || "approved" })));
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
    setServiceDuties(SERVICE_TEMPLATES[newType].roles.map((r) => ({ role: r, assignedTo: "" })));
  };

  // Compress uploaded 4K device photos for events
  const handleEventPhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 900; // Crisp web resolution
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.8);
          setEventPhotoPreview(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceDate) {
      alert("Please select a date.");
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
    const autoBanner = `📢 Upcoming: ${top.serviceType} | ${new Date(top.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - Check roster!`;
    localStorage.setItem("church_banner", autoBanner);
    setBannerNotice(autoBanner);

    broadcastDataChange();
    alert(`${chosenType} published!`);
    setServiceDate("");
  };

  const handleDeleteSchedule = (id: string) => {
    if (!confirm("Delete schedule?")) return;
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    localStorage.setItem("church_multi_schedules", JSON.stringify(updated));
    broadcastDataChange();
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
    broadcastDataChange();
  };

  // ADD EVENT WITH DEVICE UPLOAD SUPPORT
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDesc) return;

    const newEvent: ChurchEvent = {
      id: Date.now(),
      title: eventTitle,
      date: eventDate || "Upcoming",
      desc: eventDesc,
      mediaUrl: eventPhotoPreview || mediaUrl.trim(), // Prioritize uploaded device photo
      videoUrl: videoUrl.trim(),
    };

    const updated = [newEvent, ...events];
    setEvents(updated);
    localStorage.setItem("church_events", JSON.stringify(updated));

    broadcastDataChange();
    setEventTitle("");
    setEventDate("");
    setEventDesc("");
    setMediaUrl("");
    setVideoUrl("");
    setEventPhotoPreview("");
    alert("Event published live on homepage!");
  };

  const handleDeleteEvent = (id: number) => {
    const updated = events.filter((item) => item.id !== id);
    setEvents(updated);
    localStorage.setItem("church_events", JSON.stringify(updated));
    broadcastDataChange();
  };

  const handleApproveMember = (id: number) => {
    const updated = members.map((m) => (m.id === id ? { ...m, status: "approved" as const } : m));
    setMembers(updated);
    localStorage.setItem("church_members", JSON.stringify(updated));
    broadcastDataChange();
  };

  const handleDeclineMember = (id: number) => {
    if (confirm("Decline registration?")) {
      const updated = members.filter((m) => m.id !== id);
      setMembers(updated);
      localStorage.setItem("church_members", JSON.stringify(updated));
      broadcastDataChange();
    }
  };

  const handleDepartmentChange = (memberId: number, newDept: string) => {
    const updated = members.map((m) => (m.id === memberId ? { ...m, department: newDept } : m));
    setMembers(updated);
    localStorage.setItem("church_members", JSON.stringify(updated));
    broadcastDataChange();
  };

  const handleDeleteMember = (id: number) => {
    if (confirm("Remove member?")) {
      const updated = members.filter((m) => m.id !== id);
      setMembers(updated);
      localStorage.setItem("church_members", JSON.stringify(updated));
      broadcastDataChange();
    }
  };

  const handleUpdateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("church_banner", bannerNotice);
    broadcastDataChange();
    alert("Banner updated!");
  };

  const pendingMembers = members.filter((m) => m.status === "pending");
  const approvedMembers = members.filter((m) => m.status !== "pending");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full space-y-4">
          <div className="text-center">
            <span className="text-3xl">🔐</span>
            <h1 className="text-xl font-bold text-slate-900 mt-2">Tubod SDA Admin Portal</h1>
            <p className="text-xs text-slate-500">Enter PIN to manage website</p>
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
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider">Live Sync</span>
          <h1 className="text-base sm:text-lg font-bold">Tubod SDA Church Manager</h1>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Link href="/schedule" className="bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded font-semibold hidden sm:inline-block">
            View Schedule &rarr;
          </Link>
          <Link href="/" className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded">
            Live Site
          </Link>
          <button onClick={() => setIsAuthenticated(false)} className="text-rose-400 hover:underline">
            Lock
          </button>
        </div>
      </header>

      {/* TABS */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab("schedules")}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "schedules" ? "bg-blue-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>🗓️</span> Schedules ({schedules.length})
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "events" ? "bg-blue-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>📸</span> Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "members" ? "bg-blue-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>👥</span> Members ({members.length})
            {pendingMembers.length > 0 && (
              <span className="bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                {pendingMembers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("banner")}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "banner" ? "bg-blue-700 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>📢</span> Top Alert
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 pt-6">
        {/* TAB 1: SCHEDULES */}
        {activeTab === "schedules" && (
          <div className="space-y-6">
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b pb-3 border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">+ Schedule a Worship Service</h2>
              </div>
              <form onSubmit={handleAddSchedule} className="space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Service Type</label>
                    <select
                      value={chosenType}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium outline-none"
                    >
                      {Object.keys(SERVICE_TEMPLATES).map((key) => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Service Date *</label>
                    <input
                      type="date"
                      required
                      value={serviceDate}
                      onChange={(e) => setServiceDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium outline-none"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {serviceDuties.map((d, index) => (
                    <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="w-40 font-semibold text-slate-600 truncate">{d.role}</span>
                      <input
                        type="text"
                        placeholder="Name..."
                        value={d.assignedTo}
                        onChange={(e) => {
                          const updated = [...serviceDuties];
                          updated[index].assignedTo = e.target.value;
                          setServiceDuties(updated);
                        }}
                        className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs outline-none"
                      />
                    </div>
                  ))}
                </div>
                <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl">
                  + Publish Service
                </button>
              </form>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Active Rosters ({schedules.length})</h2>
              {schedules.map((s, idx) => (
                <div key={s.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{s.serviceType}</h4>
                      <p className="text-xs text-slate-500">{s.date} • {s.time}</p>
                    </div>
                    <button onClick={() => handleDeleteSchedule(s.id)} className="text-xs text-rose-600 hover:bg-rose-100 px-3 py-1 rounded border border-rose-300 font-bold">
                      Delete
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    {s.duties.map((duty, dIdx) => (
                      <div key={dIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                        <span className="w-40 font-semibold text-slate-600 truncate">{duty.role}</span>
                        <input
                          type="text"
                          value={duty.assignedTo}
                          onChange={(e) => handleUpdateAssignedDuty(s.id, dIdx, e.target.value)}
                          className="flex-1 bg-slate-50 border rounded px-2 py-1 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* TAB 2: EVENTS (WITH DEVICE FILE UPLOADER & GOOGLE DRIVE SUPPORT) */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b pb-3 border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">+ Post an Event or Video Highlight</h2>
                <p className="text-xs text-slate-500">Upload a 4K photo directly from your device or paste a Google Drive link.</p>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4 text-xs">
                {/* DEVICE FILE UPLOAD & PREVIEW */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="w-24 h-24 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                    {eventPhotoPreview ? (
                      <img src={eventPhotoPreview} alt="Event Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl text-slate-400">🖼️</span>
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <label className="block font-bold text-slate-800">Upload Photo from Device</label>
                    <p className="text-[11px] text-slate-500">Supports high-res / 4K photos. Automatically optimized for web.</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEventPhotoSelect}
                      className="text-[11px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                    {eventPhotoPreview && (
                      <button
                        type="button"
                        onClick={() => setEventPhotoPreview("")}
                        className="text-[10px] text-rose-600 hover:underline block mt-1"
                      >
                        Remove uploaded photo
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Event Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="Youth Fellowship & Music"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date & Time</label>
                    <input
                      type="text"
                      placeholder="Saturday - 3:30 PM"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Or Google Drive Photo Link</label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/.../view"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">YouTube / Facebook Video Link</label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Event summary..."
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs transition">
                    + Publish Event (Live on Home)
                  </button>
                </div>
              </form>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Active Events ({events.length})</h2>
              {events.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                  No events posted yet.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((ev) => (
                    <div key={ev.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase">{ev.date}</span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5 truncate">{ev.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ev.desc}</p>
                      </div>
                      <div className="pt-3 mt-3 border-t border-slate-200 flex justify-end">
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 px-3 py-1 rounded-md font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 3: MEMBERS */}
        {activeTab === "members" && (
          <div className="space-y-6">
            {pendingMembers.length > 0 && (
              <section className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-amber-950">⏳ Pending Review Queue ({pendingMembers.length})</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {pendingMembers.map((m) => (
                    <div key={m.id} className="bg-white p-4 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {m.photoUrl ? <img src={m.photoUrl} alt="" className="w-full h-full object-cover" /> : "👤"}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{m.fullName}</h4>
                          <p className="text-[11px] text-slate-500">{m.phone} • {m.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleDeclineMember(m.id)} className="text-xs text-rose-600 px-2.5 py-1 rounded border border-rose-200">Decline</button>
                        <button onClick={() => handleApproveMember(m.id)} className="text-xs bg-emerald-600 text-white font-bold px-3 py-1 rounded">Approve</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Approved Directory ({approvedMembers.length})</h2>
              {approvedMembers.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed rounded-xl text-xs text-slate-500">No approved members.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="p-3">Member</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Role</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {approvedMembers.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
                              {m.photoUrl ? <img src={m.photoUrl} alt="" className="w-full h-full object-cover" /> : "👤"}
                            </div>
                            {m.fullName}
                          </td>
                          <td className="p-3">{m.phone}</td>
                          <td className="p-3">
                            <select
                              value={m.department || "Regular Church Member"}
                              onChange={(e) => handleDepartmentChange(m.id, e.target.value)}
                              className="bg-white border rounded px-2 py-1 text-xs"
                            >
                              {DEPARTMENTS.map((dept) => (<option key={dept} value={dept}>{dept}</option>))}
                            </select>
                          </td>
                          <td className="p-3 text-right">
                            <button onClick={() => handleDeleteMember(m.id)} className="text-rose-600 hover:underline">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 4: BANNER */}
        {activeTab === "banner" && (
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Live Top Alert Banner</h2>
            <form onSubmit={handleUpdateBanner} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Announcement notice..."
                value={bannerNotice}
                onChange={(e) => setBannerNotice(e.target.value)}
                className="w-full bg-slate-50 border rounded-lg p-2.5 outline-none"
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-700 text-white font-bold px-4 py-2 rounded-lg">Save & Broadcast</button>
                <button
                  type="button"
                  onClick={() => {
                    setBannerNotice("");
                    localStorage.removeItem("church_banner");
                    broadcastDataChange();
                    alert("Banner cleared!");
                  }}
                  className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg"
                >
                  Clear Banner
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
