"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AuctionRoom } from "@/components/AuctionRoom";
import { LeagueModeLinks } from "@/components/LeagueModeLinks";
import { OwnerGate } from "@/components/OwnerGate";
import { useAuctionStore } from "@/lib/auctionStore";

export function LeagueScopedView({ leagueId, view }: { leagueId: string; view: "spectator" | "owner" | "projector" }) {
  const { ready, state, actions } = useAuctionStore();
  const league = state.leagues.find((item) => item.id === leagueId);
  const teams = state.teams.filter((team) => (team.leagueIds || []).includes(leagueId));

  useEffect(() => {
    if (league) actions.selectLeague(league.id);
  }, [actions, league]);

  if (!ready) {
    return (
      <div className="glass-card p-6">
        <div className="gold-kicker">Loading League</div>
        <h2 className="mt-3 text-2xl font-semibold">Preparing auction links</h2>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="glass-card p-6">
        <div className="gold-kicker">League Not Found</div>
        <h2 className="mt-3 text-3xl font-semibold">This auction league is unavailable</h2>
        <p className="mt-3 text-sm text-arena-muted">Open the public spectator lobby to choose an available league.</p>
        <Link href="/spectator" className="mt-5 red-button">Open Spectator Lobby</Link>
      </div>
    );
  }

  if (state.currentLeagueId !== league.id) {
    return (
      <div className="glass-card p-6">
        <div className="gold-kicker">Loading League</div>
        <h2 className="mt-3 text-2xl font-semibold">{league.name}</h2>
      </div>
    );
  }

  if (view === "projector") {
    return <AuctionRoom mode="projector" />;
  }

  if (view === "owner") {
    return <OwnerGate leagueId={league.id} />;
  }

  if (league.status !== "Live") {
    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="glass-card grid min-h-[420px] place-items-center p-8 text-center">
          <div className="max-w-2xl">
            <div className="gold-kicker">Upcoming League</div>
            <h2 className="mt-3 text-3xl font-semibold">{league.name}</h2>
            <p className="mt-3 text-sm leading-7 text-arena-muted">
              This league belongs to {league.createdByAdminName}. It will open as a detailed spectator auction once the admin starts it.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <MiniMetric label="Sport" value={league.sport} />
              <MiniMetric label="Teams" value={String(teams.length)} />
              <MiniMetric label="Purse" value={`Rs. ${league.purse}L`} />
            </div>
          </div>
        </div>
        <LeagueActions leagueId={league.id} mode={league.managementMode} live={false} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="red-card p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <div className="gold-kicker">League Spectator View</div>
            <h2 className="mt-2 text-3xl font-semibold">{league.name}</h2>
            <p className="mt-2 text-sm text-arena-muted">Public view for this specific league. No bidding controls are shown here.</p>
          </div>
        </div>
      </div>
      <LeagueModeLinks leagueId={league.id} mode={league.managementMode} live />
      <AuctionRoom mode="spectator" />
    </div>
  );
}

function LeagueActions({ leagueId, mode, live }: { leagueId: string; mode: "admin" | "owner"; live: boolean }) {
  return (
    <aside className="glass-card p-5">
      <div className="gold-kicker">League Views</div>
      <div className="mt-4">
        <LeagueModeLinks leagueId={leagueId} mode={mode} live={live} compact />
      </div>
      <p className="mt-4 text-sm leading-6 text-arena-muted">These views are scoped to this league only.</p>
    </aside>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs font-semibold uppercase tracking-widest text-arena-muted">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
