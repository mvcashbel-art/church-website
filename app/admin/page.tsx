"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

interface ServiceDuty {
  role: string;
  assignedTo: string;
}

interface ServiceSchedule {
  title: string;
  time: string;
  enabled: boolean;
  duties: ServiceDuty[];
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

  const [selectedServiceType, setSelectedServiceType] = useState("Midweek Worship");
  const [selectedDate, setSelectedDate] = useState("");

  // Event form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [mediaUrl, setMediaUrl] = useState(""); // Google Drive link fallback
  const [videoUrl, setVideoUrl] = useState("");
  const [eventPhotoPreview, setEventPhotoPreview] = useState(""); // Local uploaded photo

  useEffect(() => {
    async function fetchCloudData() {
      // 1. Fetch Events
      const { data: eventsData } = await supabase.from("events").select("*").order("id", { ascending: false });
      if (eventsData) setEvents(eventsData);

      // 2. Fetch Members
      const { data: membersData } = await supabase.from("members").select("*").order("id", { ascending: false });
      if (membersData) setMembers(membersData);

      // 3. Fetch Banner
      const { data: bannerData } = await supabase.from("banner").select("*").limit(1).single();
      if (bannerData && bannerData.text) setBannerNotice(bannerData.text);

      // 4. Fetch Schedule
      const { data: schedData } = await supabase.from("schedules").select("*").eq("id", "current_week").single();
      if (schedData && schedData.duties) {
        setSchedule({ ...DEFAULT_SCHEDULE, ...schedData.duties });
      }
    }

    fetchCloudData();
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

  const handleAddEvent = async (e: React.FormEvent) => {
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

    // Save to Supabase
    await supabase.from("events").upsert([newEvent]);

    broadcastDataChange();
    setEventTitle("");
    setEventDate("");
    setEventDesc("");
    setMediaUrl("");
    setVideoUrl("");
    setEventPhotoPreview("");
    alert("Event published live on homepage!");
  };

  const handleDeleteEvent = async (id: number) => {
    const updated = events.filter((item) => item.id !== id);
    setEvents(updated);
    await supabase.from("events").delete().eq("id", id);
  };

  const handleDepartmentChange = async (memberId: number, newDept: string) => {
    const updated = members.map((m) =>
      m.id === memberId ? { ...m, department: newDept } : m
    );
    setMembers(updated);
    await supabase.from("members").update({ department: newDept }).eq("id", memberId);
  };

  const handleDeleteMember = async (id: number) => {
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
    await supabase.from("members").delete().eq("id", id);
  };

  const handleToggleService = (serviceKey: keyof Omit<WeekSchedule, "dateRange">) => {
    const updated = { ...schedule };
    updated[serviceKey].enabled = !updated[serviceKey].enabled;
    setSchedule(updated);
  };

  const handleUpdateDuty = (
    serviceKey: keyof Omit<WeekSchedule, "dateRange">,
    dutyIndex: number,
    val: string
  ) => {
    const updated = { ...schedule };
    updated[serviceKey].duties[dutyIndex].assignedTo = val;
    setSchedule(updated);
  };

  const applyPresetServices = async (serviceType: string, chosenDate: string) => {
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

    let newBannerText = bannerNotice;
    if (chosenDate) {
      const parsedDate = new Date(chosenDate);
      const formatted = parsedDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      const newHeader = `${serviceType} | ${formatted}`;
      newBannerText = `📢 Upcoming: ${newHeader} - Please check the duty roster for your assignments!`;
      updated.dateRange = newHeader;
      setBannerNotice(newBannerText);
      
      await supabase.from("banner").upsert([{ id: 1, text: newBannerText }]);
    }

    setSchedule(updated);
    await supabase.from("schedules").upsert([{ id: "current_week", duties: updated }]);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("schedules").upsert([{ id: "current_week", duties: schedule }]);
    alert("Saved to cloud! All users across any device will now see the updated schedule instantly.");
  };

  const handleUpdateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("banner").upsert([{ id: 1, text: bannerNotice }]);
    alert("Top alert banner updated globally!");
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
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider">Admin</span>
          <h1 className="text-lg font-bold">Tubod SDA Church Manager (Cloud-Synced)</h1>
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

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Worship Duty Scheduler & Date Settings</h2>
              <p className="text-xs text-slate-500">
                Selecting a service automatically enables only its matching duties and updates the cloud database.
              </p>
            </div>
            <button
              onClick={handleSaveSchedule}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow transition"
            >
              Save Schedule & Visibility
            </button>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              📅 Set Worship Service & Date
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Generated Announcement Header</label>
                <input
                  type="text"
                  value={schedule.dateRange}
                  onChange={(e) => setSchedule({ ...schedule, dateRange: e.target.value })}
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
                      {schedule[key].duties.map((duty, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className="w-40 text-slate-600 font-medium truncate">{duty.role}</span>
                          <input
                            type="text"
                            value={duty.assignedTo}
                            onChange={(e) => handleUpdateDuty(key, idx, e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs focus:ring-2 focus:ring-blue-600 outline-none font-semibold text-slate-800"
                            placeholder="Assign member..."
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800">Live Top Alert Announcement Banner</h2>
            <span className="text-xs text-slate-400">Shows across every page globally</span>
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

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Registered Church Directory ({members.length})</h2>
            <p className="text-xs text-slate-500">Assign ministry roles or remove records.</p>
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
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800">Post Event or Highlight (With Photo)</h2>
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
            </div>

            <div>
              <button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2 rounded-lg text-xs shadow">
                + Publish Event & Photo to Cloud
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
