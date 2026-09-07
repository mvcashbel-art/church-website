"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("Regular Church Member");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.from("members").insert([
        {
          fullName,
          phone,
          address,
          department,
          image: imagePreview || "",
          status: "pending",
          registeredAt: new Date().toISOString(),
        },
      ]);

      if (error) {
        throw error;
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to submit registration. Please check your Supabase connection.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-bold text-blue-900 flex items-center gap-2">
            <span>✝</span> Tubod Seventh-day Adventist Church
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
            &larr; Back to Home
          </Link>
        </header>

        <main className="max-w-md mx-auto p-6 flex-1 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-4 w-full">
            <span className="text-4xl">⏳</span>
            <h1 className="text-xl font-bold text-slate-900">Application Submitted!</h1>
            <p className="text-xs text-slate-600 bg-amber-50 border border-amber-200 p-3 rounded-lg">
              Thank you, <strong className="text-amber-900">{fullName}</strong>. Your profile has been sent for <strong className="text-amber-900">pastoral & admin review</strong>. Once verified, you will be listed in the official directory.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg text-xs transition">
                Return to Home
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFullName("");
                  setPhone("");
                  setAddress("");
                  setImagePreview("");
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg text-xs transition"
              >
                Register Another Member
              </button>
            </div>
          </div>
        </main>

        <footer className="py-4 text-center text-xs text-slate-400">
          © 2026 Tubod Seventh-day Adventist Church. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-bold text-blue-900 flex items-center gap-2">
          <span>✝</span> Tubod Seventh-day Adventist Church
        </Link>
        <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
          &larr; Back to Home
        </Link>
      </header>

      <main className="max-w-lg mx-auto p-6 flex-1 flex items-center justify-center w-full">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6 w-full">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Membership Registry</span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Join Church Fellowship Directory</h1>
            <p className="text-xs text-slate-500 mt-1">
              Please provide your details below. Submissions are reviewed by church leadership before being added to active rosters.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Juan Dela Cruz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-700 outline-none text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Phone / Contact Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. 09123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-700 outline-none text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Residential Address / Purok *</label>
              <input
                type="text"
                required
                placeholder="e.g. Purok 3, Tubod, Leyte"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-700 outline-none text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Ministry / Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-700 outline-none text-slate-900 font-medium"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Profile Photo (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-3 relative w-24 h-24 rounded-full overflow-hidden border border-slate-200">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 rounded-lg text-xs shadow transition disabled:opacity-50"
            >
              {loading ? "Submitting Registration..." : "Submit Registration for Review"}
            </button>
          </form>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        © 2026 Tubod Seventh-day Adventist Church. All rights reserved.
      </footer>
    </div>
  );
}