"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Link from "next/link";

interface ChurchEvent {
  id: number;
  title: string;
  date: string;
  desc: string;
  image?: string;
}

interface Member {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  registeredAt: string;
  department?: string;
}

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

const BLANK_SCHEDULE: WeekSchedule = {
  dateRange: "",
  midweek: {
    title: "Wednesday Prayer Meeting",
    time: "Wednesday - 6:30 PM",
    enabled: false,
    duties: [
      { role: "Leader / Moderator", assignedTo: "" },
      { role: "Devotional Speaker", assignedTo: "" },
      { role: "Intercessory Prayer", assignedTo: "" },
    ],
  },
  vespers: {
    title: "Friday Vesper Worship",
    time: "Friday - 6:30 PM",
    enabled: false,
    duties: [
      { role: "Song Leader", assignedTo: "" },
      { role: "Devotional Message", assignedTo: "" },
      { role: "Opening / Closing Prayer", assignedTo: "" },
    ],
  },
  sabbathSchool: {
    title: "Sabbath School",
    time: "Saturday - 8:30 AM",
    enabled: false,
    duties: [
      { role: "Superintendent", assignedTo: "" },
      { role: "Song Leader / Chorister", assignedTo: "" },
      { role: "Mission Story Reader", assignedTo: "" },
      { role: "Lesson Teachers", assignedTo: "" },
    ],
  },
  divineWorship: {
    title: "Divine Worship Service",
    time: "Saturday - 10:30 AM",
    enabled: false,
    duties: [
      { role: "Platform Elder", assignedTo: "" },
      { role: "Preacher / Speaker", assignedTo: "" },
      { role: "Scripture Reading", assignedTo: "" },
      { role: "Pastoral Prayer", assignedTo: "" },
      { role: "Offertory / Deacons", assignedTo: "" },
    ],
  },
  ay: {
    title: "Adventist Youth (AY) Service",
    time: "Saturday - 3:30 PM",
    enabled: false,
    duties: [
      { role: "AY Program Leader", assignedTo: "" },
      { role: "Song Service", assignedTo: "" },
      { role: "Special Musical Item", assignedTo: "" },
      { role: "Vespers / Closing Sunset", assignedTo: "" },
    ],
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
  "Church Elder / Board"
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  // Start with empty array so hardcoded templates never re-spawn
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [bannerNotice, setBannerNotice] = useState("");
  const [schedule, setSchedule] = useState<WeekSchedule>(BLANK_SCHEDULE);

  const [selectedServiceType, setSelectedServiceType] = useState("Midweek Worship");
  const [selectedDate, setSelectedDate] = useState("");

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    // Only fetch saved items; if user deleted them, keep them empty
    const savedEvents = localStorage.getItem("church_events");
    if (savedEvents !== null) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {}
    }

    const savedMembers = localStorage.getItem("church_members");
    if (savedMembers) setMembers(JSON.parse(savedMembers));

    const savedBanner = localStorage.getItem("church_banner");
    if (savedBanner) setBannerNotice(savedBanner);

    const savedSchedule = localStorage.getItem("church_Worship_schedule");
    if (savedSchedule) {
      try {
        setSchedule(JSON.parse(savedSchedule));
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

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc) return;

    const newEvent: ChurchEvent = {
      id: Date.now(),
      title,
      date: date || "Upcoming",
      desc,
      image: imagePreview || "",
    };

    const updated = [newEvent, ...events];
    setEvents(updated);
    localStorage.setItem("church_events", JSON.stringify(updated));

    setTitle("");
    setDate("");
    setDesc("");
    setImagePreview("");
    alert("Event published successfully!");
  };

  const handleDeleteEvent = (id: number) => {
    const updated = events.filter((item) => item.id !== id);
    setEvents(updated);
    // Explicitly write updated array even if 0 items remain
    localStorage.setItem("church_events", JSON.stringify(updated));
  };

  // Completely wipe active schedule and remove floating alert
  const handleClearEntireSchedule = () => {
    setSchedule(BLANK_SCHEDULE);
    localStorage.setItem("church_Worship_schedule", JSON.stringify(BLANK_SCHEDULE));
    localStorage.removeItem("church_banner");
    setBannerNotice("");
    alert("Upcoming worship alert and all active schedule duties have been deleted.");
  };

  const handleDepartmentChange = (memberId: number, newDept: string) => {
    const updated = members.map((m) =>
      m.id === memberId ? { ...m, department: newDept } : m
    );
    setMembers(updated);
    localStorage.setItem("church_members", JSON.stringify(updated));
  };

  const handleDeleteMember = (id: number) => {
    if (confirm("Remove this member from the directory?")) {
      const updated = members.filter((m) => m.id !== id);
      setMembers(updated);
      localStorage.setItem("church_members", JSON.stringify(updated));
    }
  };

  const handleToggleService = (serviceKey: keyof Omit<WeekSchedule, "dateRange">) => {
    const updated = { ...schedule };
    updated[serviceKey].enabled = !updated[serviceKey].enabled;
    setSchedule(updated);
  };

  const handleUpdateWorship = (
    serviceKey: keyof Omit<WeekSchedule, "dateRange">,
    WorshipIndex: number,
    val: string
  ) => {
    const updated = { ...schedule };
    updated[serviceKey].duties[WorshipIndex].assignedTo = val;
    setSchedule(updated);
  };

  const applyPresetServices = (serviceType: string, chosenDate: string) => {
    const updated: WeekSchedule = { ...schedule };

    updated.midweek.enabled = false;
    updated.vespers.enabled = false;
    updated.sabbathSchool.enabled = false;
    updated.divineWorship.enabled = false;
    updated.ay.enabled = false;

    if (serviceType === "Midweek Worship") {
      updated.midweek.enabled = true;
    } else if (serviceType === "Friday Vespers") {
      updated.vespers.enabled = true;
    } else if (serviceType === "Sabbath Worship Day") {
      updated.sabbathSchool.enabled = true;
      updated.divineWorship.enabled = true;
      updated.ay.enabled = true;
    } else if (serviceType === "AY Ministry Program") {
      updated.ay.enabled = true;
    } else {
      updated.midweek.enabled = true;
      updated.vespers.enabled = true;
      updated.sabbathSchool.enabled = true;
      updated.divineWorship.enabled = true;
      updated.ay.enabled = true;
    }

    if (chosenDate) {
      const parsedDate = new Date(chosenDate);
      const formatted = parsedDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      const newHeader = `${serviceType} | ${formatted}`;
      const autoBanner = `📢 Upcoming: ${newHeader} - Please check the Worship roster for your assignments!`;
      updated.dateRange = newHeader;
      setBannerNotice(autoBanner);
      localStorage.setItem("church_banner", autoBanner);
    }

    setSchedule(updated);
    localStorage.setItem("church_Worship_schedule", JSON.stringify(updated));
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("church_Worship_schedule", JSON.stringify(schedule));
    alert("Worship duties and active schedule saved!");
  };

  const handleUpdateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("church_banner", bannerNotice);
    alert("Banner updated!");
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
          <Link href="/schedule" className="bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded transition text-xs font-semibold">
            View Public Roster &rarr;
          </Link>
          <Link href="/" className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition text-xs">
            Live Site
          </Link>
          <button onClick={() => setIsAuthenticated(false)} className="text-xs text-rose-400 hover:underline">
            Lock
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* 1. MANAGE & DELETE EXISTING EVENTS / HIGHLIGHTS */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">Manage Active Events & Highlights ({events.length})</h2>
              <p className="text-xs text-slate-500">Events currently showing in the public "Events & Highlights" section.</p>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs text-slate-500 font-medium">All events have been deleted. Nothing is displayed on the homepage.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((ev) => (
                <div key={ev.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col justify-between shadow-xs">
                  {ev.image ? (
                    <div className="h-32 w-full overflow-hidden bg-slate-200">
                      <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-24 bg-blue-50 flex items-center justify-center text-blue-400 text-xs font-semibold">
                      No Photo Attached
                    </div>
                  )}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">{ev.date}</span>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">{ev.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{ev.desc}</p>
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

        {/* 2. WORSHIP Worship SCHEDULER & UPCOMING SERVICE ALERT CONTROL */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upcoming Service Alert & Worship Scheduler</h2>
              <p className="text-xs text-slate-500">
                Controls both the floating side alert and the roster on <code>/schedule</code>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearEntireSchedule}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-semibold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>🗑️</span> Clear Alert & Side Notification
              </button>
              <button
                onClick={handleSaveSchedule}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow transition"
              >
                Save Schedule
              </button>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              📅 Set Service Type & Date
            </span>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Type</label>
                <select
                  value={selectedServiceType}
                  onChange={(e) => {
                    setSelectedServiceType(e.target.value);
                    applyPresetServices(e.target.value, selectedDate);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-700 outline-none"
                >
                  <option>Midweek Worship</option>
                  <option>Friday Vespers</option>
                  <option>Sabbath Worship Day</option>
                  <option>AY Ministry Program</option>
                  <option>Combined Church Service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Calendar Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    applyPresetServices(selectedServiceType, e.target.value);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-700 outline-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Generated Service Header</label>
                <input
                  type="text"
                  value={schedule.dateRange}
                  onChange={(e) => setSchedule({ ...schedule, dateRange: e.target.value })}
                  placeholder="e.g. Midweek Worship | September 9, 2026"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-950 focus:ring-2 focus:ring-blue-700 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-2">
            {(
              [
                ["midweek", "Wednesday Prayer Meeting"],
                ["vespers", "Friday Vesper Worship"],
                ["sabbathSchool", "Sabbath School (Saturday Morning)"],
                ["divineWorship", "Divine Worship (Saturday Midday)"],
                ["ay", "Adventist Youth Hour (Saturday Afternoon)"],
              ] as const
            ).map(([key, label]) => {
              const isEnabled = schedule[key]?.enabled === true;
              return (
                <div
                  key={key}
                  className={`border rounded-xl p-4 transition-colors ${
                    key === "divineWorship" ? "md:col-span-2" : ""
                  } ${isEnabled ? "bg-white border-blue-400 shadow-sm" : "bg-slate-100 border-slate-200 opacity-50"}`}
                >
                  <div className="flex items-center justify-between mb-3 border-b pb-2 border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggleService(key)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                        {label}
                      </span>
                    </label>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${isEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                      {isEnabled ? "Visible on Public Page" : "Hidden"}
                    </span>
                  </div>

                  {isEnabled && (
                    <div className="space-y-2">
                      {schedule[key].duties.map((Worship, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className="w-40 text-slate-600 font-medium truncate">{Worship.role}</span>
                          <input
                            type="text"
                            value={Worship.assignedTo}
                            onChange={(e) => handleUpdateWorship(key, idx, e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs focus:ring-2 focus:ring-blue-600 outline-none font-semibold text-slate-800"
                            placeholder="Assign member..."
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. TOP ALERT BANNER */}
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

        {/* 4. POST NEW EVENT WITH PHOTO */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">+ Add New Event or Highlight (With Photo)</h2>
          <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Event Title *</label>
              <input
                type="text"
                required
                placeholder="Youth Outreach & Baptismal Service"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-700 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date & Time</label>
              <input
                type="text"
                placeholder="Saturday - 2:00 PM"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-700 outline-none text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Upload Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-3 relative w-48 h-32 rounded-lg overflow-hidden border border-slate-200">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Details *</label>
              <textarea
                required
                rows={3}
                placeholder="Event description..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-700 outline-none text-xs"
              />
            </div>

            <div>
              <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2 rounded-lg text-xs shadow">
                + Publish Event & Photo
              </button>
            </div>
          </form>
        </section>

        {/* 5. REGISTERED MEMBERS DIRECTORY */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Registered Church Directory ({members.length})</h2>
            <p className="text-xs text-slate-500">Assign ministry roles or remove records.</p>
          </div>

          {members.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No registered members yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Address</th>
                    <th className="p-3">Ministry Role</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{m.fullName}</td>
                      <td className="p-3">{m.phone}</td>
                      <td className="p-3">{m.address}</td>
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
                          className="text-rose-600 hover:underline font-medium"
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
