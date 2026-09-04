"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    department: "Regular Church Member",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    const newMember = {
      id: Date.now(),
      fullName: formData.fullName,
      phone: formData.phone || "N/A",
      address: formData.address || "Tubod",
      department: formData.department,
      registeredAt: new Date().toLocaleDateString(),
    };

    const existing = JSON.parse(localStorage.getItem("church_members") || "[]");
    localStorage.setItem("church_members", JSON.stringify([newMember, ...existing]));
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 border border-slate-200">
        <div className="text-center mb-6">
          <Link href="/" className="text-xs font-semibold text-blue-700 hover:underline">
            &larr; Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Member Registration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tubod Seventh-day Adventist Church Directory
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-5 text-center text-sm space-y-3">
            <div className="text-3xl">🎉</div>
            <p className="font-bold text-base">Welcome to the Church Family!</p>
            <p>
              Thank you, <strong>{formData.fullName}</strong>. You are registered as <strong>{formData.department}</strong>.
            </p>
            <Link
              href="/"
              className="inline-block mt-2 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Return to Website
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Juan Dela Cruz"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contact / Mobile Number</label>
              <input
                type="tel"
                placeholder="0912 345 6789"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Address / Barangay</label>
              <input
                type="text"
                placeholder="Tubod, Leyte"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Membership / Ministry</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Regular Church Member">Regular Church Member (General)</option>
                <option value="Visitor / Guest">Visitor / Guest</option>
                <option value="Youth (AY / Adventist Youth)">Youth (AY / Adventist Youth)</option>
                <option value="Sabbath School">Sabbath School</option>
                <option value="Personal Ministries">Personal Ministries</option>
                <option value="Deacon / Deaconess">Deacon / Deaconess</option>
                <option value="Adventurers / Pathfinders">Adventurers / Pathfinders</option>
                <option value="Music & Choir">Music & Choir</option>
                <option value="Health Ministries">Health Ministries</option>
                <option value="Communications & Media">Communications & Media</option>
                <option value="Church Elder / Board">Church Elder / Board</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
            >
              Confirm Member Registration
            </button>
          </form>
        )}
      </div>
    </div>
  );
}