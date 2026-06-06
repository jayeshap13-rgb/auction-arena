"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const featureSets = {
  Admin: {
    title: "Admin control room",
    summary: "Create tournaments, manage teams and players, approve owners, run the timer, and finalize each lot.",
    action: "Open Admin",
    href: "/admin",
    items: [
      "Create multiple leagues from one admin account",
      "Edit only the leagues created by that admin",
      "Set teams, owners, purse, players, categories and base prices",
      "Start or pause auction, reset timer, undo last bid",
      "Mark players sold or unsold and move to next lot",
      "Export final squads and reports"
    ]
  },
  Owner: {
    title: "Owner bidding workspace",
    summary: "Owners login, request access to admin-created teams, and bid only after approval.",
    action: "Owner Login",
    href: "/spectator",
    items: [
      "Create a personal owner account",
      "Browse available leagues from all admins",
      "Request approval for a selected team",
      "View current lot, purse, bid history and squad",
      "Place bids from mobile or desktop after approval",
      "Track wishlist players and remaining budget"
    ]
  },
  Spectator: {
    title: "Public spectator lobby",
    summary: "Viewers can browse live and upcoming leagues without touching any bidding controls.",
    action: "View Lobby",
    href: "/spectator",
    items: [
      "Public directory of all hosted leagues",
      "Clear live and upcoming status",
      "Click live leagues for full auction detail",
      "View current player, bid leader and timer",
      "Follow squads, sold players and remaining purse",
      "No login or bidding access required"
    ]
  },
  Projector: {
    title: "Broadcast display",
    summary: "A clean venue screen for sponsors, current player, bid status, timer and sale result.",
    action: "Open Projector",
    href: "/spectator",
    items: [
      "Full-screen auction display",
      "Player photo, role, category and base price",
      "Current bid, highest bidder and countdown timer",
      "Sold and unsold result state",
      "Sponsor space and team display",
      "Designed to fit one screen without scrolling"
    ]
  }
};

const workflows = [
  ["Create tournament", "Admin creates a tournament, starts with 3 free teams, and unlocks more teams through UPI when needed."],
  ["Open registration", "Owners create accounts, choose a team, and request access while the tournament is open."],
  ["Approve access", "Admin reviews owner requests, keeps registration open or closed, and can use invite-only mode."],
  ["Setup auction", "Admin adds teams, players, purse values, bid increments, categories, base prices and photos."],
  ["Run live room", "Admin starts the auction, controls timer, current lot, sold/unsold, and manual bidding rules."],
  ["Publish outcome", "Spectators follow live results and admin exports final squads after the auction."]
];

const modeRows = [
  ["Who creates tournament?", "Admin", "Admin"],
  ["Who adds teams and players?", "Admin", "Admin"],
  ["Who places bids?", "Approved owners", "Admin"],
  ["Who controls timer?", "Admin", "Admin"],
  ["Who finalizes sold/unsold?", "Admin", "Admin"],
  ["Best for", "Leagues with real team owners", "Single-operator events"]
];

const setupCapabilities = [
  ["Tournament visibility", "Public directory or private invite-style setup."],
  ["Registration lifecycle", "Draft, open and closed states for owner/team entry."],
  ["Owner approval", "Admin can require approval or allow auto-approved team entry."],
  ["Auction rules", "Bid increment, team cap, squad size and auction format live in setup."],
  ["Auction extras", "Manual bid amount, quick team tabs and player data remain visible during bidding."],
  ["Venue views", "Spectator, owner and projector views stay scoped inside each tournament."]
];

export function FeatureExplorer() {
  const tabs = Object.keys(featureSets) as Array<keyof typeof featureSets>;
  const [active, setActive] = useState<(typeof tabs)[number]>("Admin");
  const feature = featureSets[active];
  const activeIndex = useMemo(() => tabs.indexOf(active) + 1, [active, tabs]);

  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="glass-card p-5">
          <div className="gold-kicker">Choose A View</div>
          <div className="mt-5 grid gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`rounded-2xl border p-4 text-left transition ${active === tab ? "border-arena-red bg-arena-red/15" : "border-white/10 bg-white/5 hover:border-white/25"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-arena-red/20 text-sm font-semibold">{tab[0]}</span>
                  <span className="font-semibold">{tab}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="red-card p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div>
              <div className="gold-kicker">Feature Set {activeIndex}</div>
              <h2 className="mt-3 text-3xl font-semibold leading-tight">{feature.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-arena-muted">{feature.summary}</p>
            </div>
            <Link href={feature.href} className="dark-button w-fit shrink-0">{feature.action}</Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {feature.items.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="glass-card p-6">
          <div className="gold-kicker">Workflow Preview</div>
          <h2 className="mt-3 text-3xl font-semibold leading-tight">From new league to final squads</h2>
          <div className="mt-6 grid gap-3">
            {workflows.map(([title, body], index) => (
              <div key={title} className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-[44px_minmax(0,1fr)]">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-arena-red text-sm font-semibold text-white">{index + 1}</div>
                <div>
                  <div className="font-semibold">{title}</div>
                  <p className="mt-1 text-sm leading-6 text-arena-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="gold-kicker">At A Glance</div>
          <h2 className="mt-3 text-2xl font-semibold leading-tight">Core platform coverage</h2>
          <div className="mt-5 grid gap-3">
            {["Multi-admin league ownership", "Owner approval before bidding", "Live bid history and purse tracking", "Projector and spectator modes", "Reports and final squads"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 font-semibold">{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="red-card p-5 sm:p-6">
        <div className="gold-kicker">User Setup System</div>
        <h2 className="mt-3 text-3xl font-semibold leading-tight">Tournament setup works like a real auction platform</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {setupCapabilities.map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold">{title}</div>
              <p className="mt-2 text-sm leading-6 text-arena-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <div className="gold-kicker">Mode Comparison</div>
          <h2 className="mt-2 text-2xl font-semibold">Owner-bidding vs admin-managed</h2>
        </div>
        <div className="grid divide-y divide-white/10">
          <div className="hidden grid-cols-3 gap-4 bg-white/5 p-4 text-sm font-semibold md:grid">
            <div>Decision</div>
            <div>Owner-bidding</div>
            <div>Admin-managed</div>
          </div>
          {modeRows.map(([label, owner, admin]) => (
            <div key={label} className="grid gap-3 p-4 md:grid-cols-3 md:gap-4">
              <div className="font-semibold">{label}</div>
              <div className="text-sm leading-6 text-arena-muted">{owner}</div>
              <div className="text-sm leading-6 text-arena-muted">{admin}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
