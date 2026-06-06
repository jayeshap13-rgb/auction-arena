"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AuctionRoom } from "@/components/AuctionRoom";
import { LeagueModeLinks } from "@/components/LeagueModeLinks";
import { OwnerGate } from "@/components/OwnerGate";
import { useAuctionStore } from "@/lib/auctionStore";
import { PlayerCard, TeamPurse } from "@/components/ui";

export function LeagueScopedView({ leagueId, view }: { leagueId: string; view: "spectator" | "owner" | "projector" }) {
  const { ready, state, leagueTeams, leaguePlayers, currentPlayer, currentBid, currentBids, leader, actions } = useAuctionStore();
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
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 space-y-5">
        <div className="red-card p-4 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <div className="gold-kicker">Live Spectator Feed</div>
              <h2 className="mt-2 text-2xl font-semibold sm:text-4xl">{league.name}</h2>
              <p className="mt-2 text-sm leading-6 text-arena-muted">
                {league.sport} | {league.managementMode === "owner" ? "Owner bidding" : "Admin managed"} | No bidding access in this view.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <MiniMetric label="Timer" value={`${state.timer}s`} />
              <MiniMetric label="Bid" value={`Rs. ${currentBid}L`} />
              <MiniMetric label="Leader" value={leader} />
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <PlayerCard player={currentPlayer} featured />
          <div className="glass-card p-5">
            <div className="gold-kicker">Live Bid Feed</div>
            <div className="mt-4 space-y-3">
              {(currentBids.length ? currentBids.slice(0, 6) : [{ id: "open", team: "Waiting for first bid", amount: currentPlayer.basePrice, time: "--" }]).map((bid) => (
                <div key={bid.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="min-w-0">
                    <div className="single-line font-semibold">{bid.team}</div>
                    <div className="single-line text-xs text-arena-muted">{bid.time}</div>
                  </div>
                  <div className="font-semibold text-arena-gold">Rs. {bid.amount}L</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ListPanel title="Sold Players" items={leaguePlayers.filter((player) => player.status === "Sold").slice(-6).reverse().map((player) => `${player.name} | ${player.soldTo || "Team"} | Rs. ${player.soldPrice || player.basePrice}L`)} />
          <ListPanel title="Unsold Queue" items={leaguePlayers.filter((player) => player.status === "Unsold").slice(0, 6).map((player) => `${player.name} | ${player.role}`)} />
        </div>
      </section>

      <aside className="space-y-5">
        <LeagueActions leagueId={league.id} mode={league.managementMode} live />
        <div className="glass-card p-5">
          <div className="gold-kicker">Team Purse</div>
          <div className="mt-4 space-y-3">
            {leagueTeams.map((team) => <TeamPurse key={team.id} team={team} />)}
          </div>
        </div>
      </aside>
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

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass-card p-5">
      <div className="gold-kicker">{title}</div>
      <div className="mt-4 space-y-2">
        {(items.length ? items : ["No entries yet"]).map((item) => (
          <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-arena-muted">{item}</div>
        ))}
      </div>
    </div>
  );
}
