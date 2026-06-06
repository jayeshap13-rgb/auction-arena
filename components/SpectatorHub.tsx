"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuctionRoom } from "@/components/AuctionRoom";
import { LeagueModeLinks } from "@/components/LeagueModeLinks";
import { useAuctionStore } from "@/lib/auctionStore";

export function SpectatorHub() {
  const router = useRouter();
  const { state, currentBid, currentPlayer, leader, actions } = useAuctionStore();
  const [selectedLeagueId, setSelectedLeagueId] = useState(state.currentLeagueId);
  const selectedLeague = state.leagues.find((league) => league.id === selectedLeagueId) || state.league;
  const selectedTeams = useMemo(
    () => state.teams.filter((team) => (team.leagueIds || []).includes(selectedLeague.id)),
    [selectedLeague.id, state.teams]
  );
  const liveLeagues = state.leagues.filter((league) => league.status === "Live").length;

  if (state.leagues.length === 0) {
    return (
      <div className="glass-card grid min-h-[420px] place-items-center p-8 text-center">
        <div className="max-w-xl">
          <div className="gold-kicker">Fresh Trial</div>
          <h2 className="mt-3 text-3xl font-semibold">No auctions are available yet</h2>
          <p className="mt-3 text-sm leading-7 text-arena-muted">
            A new admin can create an account, publish unlimited tournaments, run admin-managed bidding with 3 teams free, or open owner self-bidding with paid owner logins.
          </p>
        </div>
      </div>
    );
  }

  function openLeague(leagueId: string) {
    const league = state.leagues.find((item) => item.id === leagueId);
    if (!league) return;
    actions.selectLeague(leagueId);
    setSelectedLeagueId(leagueId);
    if (league.status === "Live") router.push(`/live/spectator?leagueId=${encodeURIComponent(leagueId)}`);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div className="glass-card p-5">
          <div className="gold-kicker">Spectator Lobby</div>
          <h2 className="mt-2 text-2xl font-semibold">All auction leagues</h2>
          <p className="mt-2 text-sm text-arena-muted">Live leagues open into the detailed auction feed. Upcoming leagues stay visible here until admin starts them.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniMetric label="Live" value={String(liveLeagues)} />
            <MiniMetric label="Total" value={String(state.leagues.length)} />
          </div>
        </div>

        <div className="space-y-3">
          {state.leagues.map((league) => {
            const teams = state.teams.filter((team) => (team.leagueIds || []).includes(league.id));
            const live = league.status === "Live";
            const active = selectedLeague.id === league.id;
            return (
              <button
                key={league.id}
                onClick={() => openLeague(league.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${active ? "border-arena-red bg-arena-red/15" : "border-white/10 bg-white/5"} hover:border-arena-red/50 hover:bg-white/10`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="single-line text-xs font-semibold uppercase tracking-widest text-arena-muted">{league.sport}</div>
                    <div className="mt-2 single-line font-semibold">{league.name}</div>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${live ? "border-arena-red/40 bg-arena-red/15 text-red-100" : "border-arena-gold/30 bg-arena-gold/10 text-arena-gold"}`}>
                    {live ? "Open Live" : league.registrationStatus === "Open" ? "Register" : "Preview"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-arena-muted">
                  <span>{teams.length} teams</span>
                  <span>Round {league.round}</span>
                  <span>{league.managementMode === "owner" ? "Owner bidding" : "Admin managed"}</span>
                  <span>{league.visibility === "private" ? "Private" : "Public"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="min-w-0 space-y-5">
        {selectedLeague.status === "Live" ? (
          <>
            <div className="red-card p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div className="min-w-0">
                  <div className="gold-kicker">Live Auction Detail</div>
                  <h2 className="mt-2 single-line text-3xl font-semibold">{selectedLeague.name}</h2>
                  <p className="mt-2 text-sm text-arena-muted">
                    Current lot: {currentPlayer.name} | Bid: Rs. {currentBid}L | Leader: {leader}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <MiniMetric label="Teams" value={String(selectedTeams.length)} />
                  <MiniMetric label="Timer" value={`${state.timer}s`} />
                  <MiniMetric label="Status" value={state.league.status} />
                </div>
              </div>
            </div>
            <LeagueModeLinks leagueId={selectedLeague.id} mode={selectedLeague.managementMode} live />
            <AuctionRoom mode="spectator" />
          </>
        ) : (
          <div className="glass-card grid min-h-[420px] place-items-center p-8 text-center">
            <div className="max-w-xl">
              <div className="gold-kicker">Upcoming League</div>
              <h2 className="mt-3 text-3xl font-semibold">{selectedLeague.name}</h2>
              <p className="mt-3 text-sm text-arena-muted">
                This league is not live yet. Once the admin starts the auction, spectators can open the full live auction and bidding detail here.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MiniMetric label="Sport" value={selectedLeague.sport} />
                <MiniMetric label="Teams" value={String(selectedTeams.length)} />
                <MiniMetric label="Purse" value={`Rs. ${selectedLeague.purse}L`} />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-black/25 p-3">
      <div className="single-line text-[11px] font-semibold uppercase tracking-widest text-arena-muted">{label}</div>
      <div className="mt-1 single-line font-semibold text-white">{value}</div>
    </div>
  );
}
