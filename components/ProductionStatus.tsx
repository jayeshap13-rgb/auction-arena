"use client";

import { hasSupabaseConfig } from "@/lib/supabase";

export function ProductionStatus() {
  const supabaseReady = hasSupabaseConfig();
  const razorpayReady = Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
  const productionReady = supabaseReady && razorpayReady;

  return (
    <div className={`rounded-2xl border p-4 ${productionReady ? "border-arena-red/30 bg-arena-red/10" : "border-arena-gold/25 bg-arena-gold/10"}`}>
      <div className="gold-kicker">{productionReady ? "Production Mode" : "Browser Trial Mode"}</div>
      <h3 className="mt-2 text-xl font-semibold">{productionReady ? "Shared backend is configured" : "Connect backend before real users join"}</h3>
      <p className="mt-2 text-sm leading-6 text-arena-muted">
        {productionReady
          ? "Authentication, shared data, and payment checkout keys are present. Use Vercel for server-side payment verification."
          : "This browser can test the auction flow, but admins, owners, bids, and payments will not sync across all users until Supabase and Razorpay env vars are added on Vercel."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
        <span className={`rounded-full border px-3 py-1 ${supabaseReady ? "border-arena-red/30 bg-arena-red/10 text-white" : "border-white/10 bg-white/5 text-arena-muted"}`}>Supabase {supabaseReady ? "ready" : "missing"}</span>
        <span className={`rounded-full border px-3 py-1 ${razorpayReady ? "border-arena-red/30 bg-arena-red/10 text-white" : "border-white/10 bg-white/5 text-arena-muted"}`}>Razorpay {razorpayReady ? "ready" : "missing"}</span>
      </div>
    </div>
  );
}
