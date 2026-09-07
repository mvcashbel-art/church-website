"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ServiceAlertToast() {
  const [visible, setVisible] = useState(false);
  const [alertText, setAlertText] = useState("");

  useEffect(() => {
    async function checkAlert() {
      try {
        const { data, error } = await supabase
          .from("banner")
          .select("*")
          .limit(1)
          .single();

        if (!error && data && data.text) {
          setAlertText(data.text);
          setVisible(true);
        }
      } catch (e) {
        console.error(e);
      }
    }

    checkAlert();
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-800 flex items-start gap-3 animate-fade-in">
      <span className="text-xl">📢</span>
      <div className="flex-1 text-xs">
        <p className="font-bold text-amber-400 mb-0.5">Church Announcement</p>
        <p className="text-slate-300 leading-relaxed">{alertText}</p>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-slate-400 hover:text-white text-sm font-bold px-1.5 py-0.5"
      >
        ✕
      </button>
    </div>
  );
}