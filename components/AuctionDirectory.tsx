"use client";

import { useRouter } from "next/navigation";
import { LeagueModeLinks } from "@/components/LeagueModeLinks";
import { useAuctionStore } from "@/lib/auctionStore";

export function AuctionDirectory() {
  const router = useRouter();
  const { state, currentBid, actions } = useAuctionStore();

  function openLeague(leagueId: string) {
    actions.selectLeague(leagueId);
    router.push(`/live/spectator?leagueId=${encodeURIComponent(leagueId)}`);
  }

  return (
    <div className="red-card overflow-hidden">
      <div className="border-b border-white/10 bg-black/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="gold-kicker">Auction Directory</div>
            <h2 className="mt-2 text-xl font-semibold sm:text-2xl">Live and upcoming leagues</h2>
          </div>
          <div className="shrink-0 rounded-full border border-arena-gold/30 bg-arena-gold/10 px-3 py-2 text-xs font-semibold text-arena-gold sm:px-4 sm:text-sm">
            {state.leagues.length} rooms
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
        {state.leagues.length === 0 && (
          <div className="glass-card p-5 md:col-span-2 xl:col-span-3">
            <div className="gold-kicker">Fresh Trial</div>
            <h3 className="mt-2 text-xl font-semibold">No auctions have been published yet</h3>
            <p className="mt-2 text-sm text-arena-muted">Create a new admin account, then publish unlimited tournaments. Admin-managed leagues include 3 teams free; owner self-bidding leagues bill approved owner logins.</p>
          </div>
        )}
        {state.leagues.map((league) => {
          const teams = state.teams.filter((team) => (team.leagueIds || []).includes(league.id));
          const isActive = league.id === state.currentLeagueId;
          const statusLabel = league.status === "Live" ? "Live" : league.registrationStatus === "Open" ? "Registration Open" : "Upcoming";
          return (
            <div
              key={league.id}
              className="glass-card group grid min-h-[132px] content-between p-4 text-left transition hover:-translate-y-1 hover:border-arena-red/50"
            >
              <button type="button" onClick={() => openLeague(league.id)} className="text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="single-line text-xs font-semibold uppercase tracking-widest text-arena-muted">{league.sport}</div>
                    <h3 className="mt-2 single-line text-lg font-semibold group-hover:text-white">{league.name}</h3>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${league.status === "Live" ? "border-arena-red/40 bg-arena-red/15 text-red-100" : "border-arena-gold/30 bg-arena-gold/10 text-arena-gold"}`}>
                    {statusLabel}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-2">
                    <div className="single-line text-[11px] text-arena-muted">Teams</div>
                    <div className="single-line font-semibold">{teams.length}</div>
                  </div>
                  <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-2">
                    <div className="single-line text-[11px] text-arena-muted">Bid</div>
                    <div className="single-line font-semibold">{isActive ? `Rs. ${currentBid}L` : "Soon"}</div>
                  </div>
                  <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-2">
                    <div className="single-line text-[11px] text-arena-muted">Mode</div>
                    <div className="single-line font-semibold">{league.managementMode === "owner" ? "Owner" : "Admin"}</div>
                  </div>
                </div>
              </button>
              {league.status === "Live" && (
                <div className="mt-3">
                  <LeagueModeLinks leagueId={league.id} mode={league.managementMode} live compact />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
