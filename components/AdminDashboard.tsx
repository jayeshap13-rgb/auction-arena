"use client";

import Link from "next/link";
import { useAuctionStore } from "@/lib/auctionStore";
import { TeamPurse } from "./ui";

export function AdminDashboard() {
  const { state, leagueTeams, leaguePlayers, currentPlayer, currentBid, leader, actions } = useAuctionStore();
  const sold = leaguePlayers.filter((player) => player.status === "Sold").length;
  const unsold = leaguePlayers.filter((player) => player.status === "Unsold").length;
  const queued = leaguePlayers.filter((player) => player.status === "Queued").length;

  const modules = [
    ["Tournament Setup", "Teams, purse, sport and rules", "/setup", `${leagueTeams.length} teams`],
    ["Player Pool", "Add, upload, wishlist and send lots", "/players", `${leaguePlayers.length} players`],
    ["Live Auction", "Bidding, timer, sold and unsold controls", "/auction", state.league.status],
    ["Reports", "Export squads, purse and bid history", "/reports", `${state.bids.length} bids`]
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 space-y-5">
        <div className="red-card p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="gold-kicker">Auction Command Center</div>
              <h2 className="mt-3 text-3xl font-semibold">{state.league.name}</h2>
              <p className="mt-2 text-sm text-arena-muted">Current lot: {currentPlayer.name} | Leader: {leader} | Bid: Rs. {currentBid}L</p>
            </div>
            <div className="grid grid-cols-3 gap-3 lg:w-[360px]">
              <DashMetric label="Sold" value={String(sold)} />
              <DashMetric label="Unsold" value={String(unsold)} />
              <DashMetric label="Queued" value={String(queued)} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <button onClick={() => actions.start()} className="red-button">Start Auction</button>
          <button onClick={actions.pause} className="dark-button">Pause</button>
          <button onClick={() => actions.nextLot(false)} className="dark-button">Next Lot</button>
          <button onClick={() => actions.resetTimer(24)} className="dark-button">Reset Timer</button>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <div className="gold-kicker">Admin Features</div>
            <h2 className="mt-2 text-2xl font-semibold">Choose what you want to manage</h2>
          </div>
          <div className="grid gap-0 md:grid-cols-2">
            {modules.map(([title, body, href, stat]) => (
              <Link key={title} href={href} className="group border-b border-white/10 p-5 transition hover:bg-arena-red/10 md:border-r">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="single-line text-xl font-semibold group-hover:text-white">{title}</h3>
                    <p className="mt-2 text-sm text-arena-muted">{body}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-arena-red/30 bg-arena-red/10 px-3 py-1 text-xs font-semibold text-red-100">{stat}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="glass-card p-5">
            <div className="gold-kicker">Current Lot</div>
            <div className="mt-4 flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-arena-red to-arena-gold text-xl font-semibold">{currentPlayer.photo}</div>
              <div className="min-w-0">
                <h3 className="single-line text-xl font-semibold">{currentPlayer.name}</h3>
                <p className="text-sm text-arena-muted">{currentPlayer.role} | {currentPlayer.category}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="gold-kicker">Auction Health</div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <DashMetric label="Timer" value={`${state.timer}s`} />
              <DashMetric label="Round" value={String(state.league.round)} />
              <DashMetric label="Status" value={state.league.status} />
            </div>
          </div>
        </div>
      </section>

      <aside className="glass-card p-5">
        <div className="gold-kicker">Purse Monitor</div>
        <div className="mt-4 space-y-3">
          {leagueTeams.map((team) => <TeamPurse key={team.id} team={team} />)}
        </div>
      </aside>
    </div>
  );
}

function DashMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="single-line text-xs text-arena-muted">{label}</div>
      <div className="single-line mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
