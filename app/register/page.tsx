"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";

interface Member {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  registeredAt: string;
  department?: string;
  photoUrl?: string;
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("Regular Church Member");
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  // Resize and compress photo so it easily fits localStorage
  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 250;
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
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          setPhotoPreview(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    const newMember: Member = {
      id: Date.now(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      registeredAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      department,
      photoUrl: photoPreview || "",
    };

    const saved = localStorage.getItem("church_members");
    const members: Member[] = saved ? JSON.parse(saved) : [];
    members.unshift(newMember);
    localStorage.setItem("church_members", JSON.stringify(members));

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-blue-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-blue-900 text-sm sm:text-base flex items-center gap-2">
            <span>✝</span> Tubod Seventh-day Adventist Church
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-10">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-3xl">
                ✓
              </div>
              <h2 className="text-2xl font-black text-slate-900">Registration Complete!</h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Thank you, <strong>{fullName}</strong>. Your membership profile has been saved to the church fellowship directory.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Link
                  href="/"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  Return to Home
                </Link>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFullName("");
                    setPhone("");
                    setAddress("");
                    setPhotoPreview("");
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2"
                >
                  Register Another Member
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 border-b pb-4 border-slate-100">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                  Fellowship Directory
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-1">Church Member Registration</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Connect with the congregation, church leadership, and weekly duty rosters.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                {/* PHOTO UPLOAD & PREVIEW */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="w-20 h-20 rounded-full bg-slate-200 border-2 border-blue-600 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl text-slate-400">👤</span>
                    )}
                  </div>
                  <div className="space-y-1 text-center sm:text-left flex-1">
                    <label className="block font-bold text-slate-800">Profile Photo</label>
                    <p className="text-[11px] text-slate-500">Attach a portrait or selfie (optional).</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="text-[11px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Juan Dela Cruz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0912 345 6789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Primary Department / Group</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option>Regular Church Member</option>
                      <option>Visitor / Guest</option>
                      <option>Youth (AY / Adventist Youth)</option>
                      <option>Sabbath School</option>
                      <option>Personal Ministries</option>
                      <option>Deacon / Deaconess</option>
                      <option>Adventurers / Pathfinders</option>
                      <option>Music & Choir</option>
                      <option>Health Ministries</option>
                      <option>Communications & Media</option>
                      <option>Church Elder / Board</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Barangay / Address</label>
                  <input
                    type="text"
                    placeholder="e.g., Tubod, Leyte"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-blue-600/20 active:scale-[0.99]"
                  >
                    Submit Member Registration
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
