"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type LeagueModeLinksProps = {
  leagueId: string;
  mode: "admin" | "owner";
  live: boolean;
  showAdmin?: boolean;
  compact?: boolean;
};

const modeCopy = {
  spectator: ["Spectator", "Public live feed"],
  owner: ["Owner Bid", "Approved owner login"],
  projector: ["Projector", "Full-screen display"],
  admin: ["Admin", "Control room"]
};

export function LeagueModeLinks({ leagueId, mode, live, showAdmin = false, compact = false }: LeagueModeLinksProps) {
  const [copied, setCopied] = useState("");
  const links = useMemo(() => {
    const items = [
      { id: "spectator", href: `/live/spectator?leagueId=${encodeURIComponent(leagueId)}`, show: true },
      { id: "owner", href: `/live/owner?leagueId=${encodeURIComponent(leagueId)}`, show: mode === "owner" },
      { id: "projector", href: `/live/projector?leagueId=${encodeURIComponent(leagueId)}`, show: true },
      { id: "admin", href: "/admin", show: showAdmin }
    ];
    return items.filter((item) => item.show);
  }, [leagueId, mode, showAdmin]);

  function absoluteUrl(path: string) {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  }

  async function copyLink(path: string, id: string) {
    try {
      await navigator.clipboard.writeText(absoluteUrl(path));
      setCopied(id);
      window.setTimeout(() => setCopied(""), 1400);
    } catch {
      setCopied("");
    }
  }

  return (
    <div className={compact ? "grid gap-2" : "glass-card p-4 sm:p-5"}>
      {!compact && (
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <div className="gold-kicker">Live Mode Links</div>
            <h3 className="mt-2 text-xl font-semibold">Share this auction in different modes</h3>
          </div>
          <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${live ? "border-arena-red/40 bg-arena-red/15 text-red-100" : "border-arena-gold/30 bg-arena-gold/10 text-arena-gold"}`}>
            {live ? "Auction Live" : "Available after start"}
          </span>
        </div>
      )}
      <div className={`grid gap-2 ${compact ? "" : "sm:grid-cols-2 xl:grid-cols-4"}`}>
        {links.map((item) => {
          const [title, body] = modeCopy[item.id as keyof typeof modeCopy];
          const disabled = !live && item.id !== "admin";
          return (
            <div key={item.id} className={`rounded-2xl border p-3 ${disabled ? "border-white/10 bg-white/[0.035] opacity-70" : "border-white/10 bg-white/5"}`}>
              <Link
                href={item.href}
                className={`block rounded-xl px-2 py-1 transition ${disabled ? "pointer-events-none text-arena-muted" : "hover:text-arena-gold"}`}
                aria-disabled={disabled}
              >
                <span className="single-line block font-semibold">{title}</span>
                <span className="single-line mt-1 block text-xs text-arena-muted">{disabled ? "Starts after auction goes live" : body}</span>
              </Link>
              <button
                type="button"
                disabled={disabled}
                onClick={() => copyLink(item.href, item.id)}
                className={`mt-2 w-full rounded-full border px-3 py-1.5 text-xs font-semibold transition ${disabled ? "cursor-not-allowed border-white/10 text-arena-muted" : "border-arena-gold/30 bg-arena-gold/10 text-arena-gold hover:bg-arena-gold/20"}`}
              >
                {copied === item.id ? "Copied" : "Copy Link"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
