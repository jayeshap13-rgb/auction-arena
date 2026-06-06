"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuctionStore } from "@/lib/auctionStore";
import { BrandLogo } from "@/components/BrandLogo";
import { LeagueModeLinks } from "@/components/LeagueModeLinks";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PlayerCard, TeamPurse } from "./ui";

type Mode = "admin" | "owner" | "spectator" | "projector";
export function AuctionRoom({ mode = "admin", ownerTeamId, allowAdminBids = true }: { mode?: Mode; ownerTeamId?: string; allowAdminBids?: boolean }) {
  const { state, leagueTeams, leaguePlayers, currentPlayer, currentBid, currentBids, highestBid, leader, actions } = useAuctionStore();
  const [selectedTeam, setSelectedTeam] = useState(state.teams[0]?.id || "");
  const [ownerTeam, setOwnerTeam] = useState(state.teams[0]?.id || "");
  const [bidAmount, setBidAmount] = useState(currentBid + 10);
  const [showStartOptions, setShowStartOptions] = useState(false);
  const [startMessage, setStartMessage] = useState("");
  const [adminTab, setAdminTab] = useState<"control" | "bid" | "result" | "links">("control");
  const [auctionOrder, setAuctionOrder] = useState<"sequence" | "random">(state.league.auctionOrder || "sequence");

  const activeTeamId = mode === "owner" ? (ownerTeamId || ownerTeam) : selectedTeam;
  const activeTeam = leagueTeams.find((team) => team.id === activeTeamId) || state.teams.find((team) => team.id === activeTeamId) || leagueTeams[0] || state.teams[0];
  const bidIncrement = Number(state.league.bidIncrement) || 10;
  const nextBid = Math.max(Number(bidAmount) || 0, currentBid + bidIncrement);
  const canBid = currentPlayer.status === "Under Auction" && activeTeam && nextBid <= activeTeam.purse - activeTeam.spent;
  const soldPlayers = leaguePlayers.filter((player) => player.status === "Sold");
  const unsoldPlayers = leaguePlayers.filter((player) => player.status === "Unsold");
  const wishlist = leaguePlayers.filter((player) => player.wishlist);
  const leaderboard = useMemo(() => [...leagueTeams].sort((a, b) => b.spent - a.spent), [leagueTeams]);
  const canStartAuction = leagueTeams.length > 0 && leaguePlayers.length > 0;

  function submitBid() {
    if (!activeTeam) return;
    actions.placeBid(activeTeam.id, nextBid);
    setBidAmount(nextBid + 10);
  }

  function startAuction() {
    if (!canStartAuction) {
      setStartMessage("Add at least one team and one player before starting the auction.");
      return;
    }
    setStartMessage("");
    setAuctionOrder(state.league.auctionOrder || "sequence");
    setShowStartOptions(true);
  }

  function confirmStartAuction(order = auctionOrder) {
    actions.start(order);
    setShowStartOptions(false);
  }

  if (mode === "projector") {
    return (
      <div className="projector grid h-full min-h-0 grid-rows-[56px_minmax(0,1fr)_76px] overflow-hidden bg-[#05070b] p-3 text-white">
        <header className="flex min-h-0 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.06] px-4">
          <Link href="/" className="flex min-w-0 items-center gap-3 transition hover:text-arena-gold">
            <span className="grid h-11 w-11 shrink-0 place-items-center">
              <BrandLogo className="h-full w-full" priority />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-arena-gold">Broadcast View</span>
              <span className="mt-0.5 block single-line text-xl font-semibold leading-tight">{state.league.name}</span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <div className="hidden rounded-full border border-arena-gold/30 bg-arena-gold/10 px-3 py-1.5 text-xs font-semibold text-arena-gold md:block">{state.league.sponsor}</div>
            <div className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${state.league.status === "Live" ? "border-arena-red/40 bg-arena-red/15 text-red-100" : "border-white/10 bg-white/5 text-arena-muted"}`}>{state.league.status}</div>
          </div>
        </header>

        <section className="grid min-h-0 gap-3 py-3 lg:grid-cols-[34%_minmax(0,1fr)]">
          <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-3">
            <div className="grid min-h-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.06]">
              {isImageSource(currentPlayer.photo) ? (
                <img src={currentPlayer.photo} alt={currentPlayer.name} className="aspect-square w-[min(78%,330px)] rounded-3xl border border-white/10 object-cover" />
              ) : (
                <div className="grid aspect-square w-[min(78%,330px)] place-items-center rounded-3xl border border-white/10 bg-gradient-to-br from-arena-red to-arena-gold text-7xl font-semibold text-white">
                  {currentPlayer.photo}
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-arena-gold">{currentPlayer.category} / {currentPlayer.role}</div>
              <h2 className="mt-2 text-3xl font-semibold leading-tight">{currentPlayer.name}</h2>
              <p className="mt-2 line-clamp-2 text-sm leading-5 text-arena-muted">{currentPlayer.stats}</p>
            </div>
          </div>

          <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-3">
            <div className="grid grid-cols-4 gap-3">
              <BroadcastMetric label="Base" value={`Rs. ${currentPlayer.basePrice}L`} />
              <BroadcastMetric label="Round" value={`${state.league.round}`} />
              <BroadcastMetric label="Status" value={currentPlayer.status} gold={currentPlayer.status === "Sold"} />
              <BroadcastMetric label="Clock" value={`${state.timer}s`} gold />
            </div>

            <div className="grid min-h-0 rounded-2xl border border-arena-gold/30 bg-gradient-to-br from-arena-gold/15 via-white/[0.06] to-arena-red/10 p-5">
              <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_260px] gap-4">
                <div className="grid min-w-0 content-center">
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-arena-muted">Current Bid</div>
                  <div className="mt-3 text-7xl font-semibold leading-none text-arena-gold">Rs. {currentBid}L</div>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-arena-muted">Highest Bidder</div>
                    <div className="mt-1 single-line text-3xl font-semibold">{leader}</div>
                  </div>
                </div>
                <div className="min-h-0 rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-arena-gold">Bid Feed</div>
                  <div className="mt-3 grid gap-2">
                    {(currentBids.length ? currentBids.slice(0, 5) : [{ id: "open", team: "Waiting for first bid", amount: currentPlayer.basePrice, time: "--" }]).map((bid) => (
                      <div key={bid.id} className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
                        <div className="single-line text-sm font-semibold">{bid.team}</div>
                        <div className="mt-1 flex items-center justify-between gap-3 text-xs text-arena-muted">
                          <span>{bid.time}</span>
                          <span className="font-semibold text-arena-gold">Rs. {bid.amount}L</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl border p-4 text-center ${state.soldFlash ? "border-arena-gold/40 bg-arena-gold/15" : "border-white/10 bg-white/[0.055]"}`}>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-arena-muted">Auction Result</div>
              <div className={`mt-1 text-2xl font-semibold ${state.soldFlash ? "text-arena-gold" : "text-white"}`}>
                {state.soldFlash === "Sold" ? `Sold to ${highestBid?.team || "Team"}` : state.soldFlash === "Unsold" ? "Unsold" : "Awaiting final call"}
              </div>
            </div>
          </div>
        </section>

        <footer className="projector-footer grid min-h-0 grid-cols-4 gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-3">
          {leaderboard.slice(0, 4).map((team) => (
            <div key={team.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              {isImageSource(team.logo) ? (
                <img src={team.logo} alt={team.name} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="h-9 w-9 shrink-0 rounded-lg" style={{ background: team.color }} />
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold leading-tight">{team.name}</div>
                <div className="text-xs text-arena-muted">Rs. {team.purse - team.spent}L left | {team.squad} players</div>
              </div>
            </div>
          ))}
        </footer>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="space-y-5 min-w-0">
        <div className="red-card p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <div className="gold-kicker">{mode === "admin" ? "Auction Control Room" : mode === "owner" ? "Owner Bidding Room" : "Auction Viewer"}</div>
              <h2 className="mt-2 single-line text-2xl font-semibold sm:text-3xl">{state.league.name}</h2>
              <p className="mt-2 text-sm text-arena-muted">Current lot: {currentPlayer.name} | {leaguePlayers.length} players | {leagueTeams.length} teams</p>
            </div>
            <AuctionHeader status={state.league.status} timer={state.timer} currentBid={currentBid} leader={leader} round={state.league.round} />
          </div>
        </div>
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
          <PlayerCard player={currentPlayer} featured />
          <div className="glass-card p-4 sm:p-5">
            <div className="gold-kicker">Live Lot</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoPill label="Base" value={`Rs. ${currentPlayer.basePrice}L`} />
              <InfoPill label="Status" value={currentPlayer.status} />
              <InfoPill label="Highest Bidder" value={leader} />
              <InfoPill label="Bids on Lot" value={String(currentBids.length)} />
            </div>
            {mode === "admin" && (
              <>
                <AdminControlTabs active={adminTab} onChange={setAdminTab} />
                {showStartOptions && (
                  <div className="mt-5 rounded-2xl border border-arena-gold/30 bg-arena-gold/10 p-4">
                    <div className="gold-kicker">Start Auction</div>
                    <h3 className="mt-2 text-xl font-semibold">Choose player lot order</h3>
                    <p className="mt-2 text-sm leading-6 text-arena-muted">
                      Sequence follows the uploaded/player list order. Random picks the opening lot and next lots randomly from available queued players.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={() => setAuctionOrder("sequence")}
                        className={`rounded-xl border p-4 text-left text-sm font-semibold ${auctionOrder === "sequence" ? "border-arena-red bg-arena-red/15 text-white" : "border-white/10 bg-white/5 text-arena-muted"}`}
                      >
                        Sequence order
                      </button>
                      <button
                        onClick={() => setAuctionOrder("random")}
                        className={`rounded-xl border p-4 text-left text-sm font-semibold ${auctionOrder === "random" ? "border-arena-red bg-arena-red/15 text-white" : "border-white/10 bg-white/5 text-arena-muted"}`}
                      >
                        Random order
                      </button>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button onClick={() => confirmStartAuction()} className="red-button">Start Auction</button>
                      <button onClick={() => setShowStartOptions(false)} className="dark-button">Cancel</button>
                    </div>
                  </div>
                )}
                {adminTab === "control" && (
                  <div className="mt-5">
                    {(startMessage || !canStartAuction) && (
                      <div className="mb-3 rounded-xl border border-arena-gold/25 bg-arena-gold/10 p-3 text-sm text-arena-muted">
                        {startMessage || "Add at least one team and one player before starting the auction."}
                      </div>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <button onClick={startAuction} disabled={!canStartAuction} className={`red-button ${!canStartAuction ? "cursor-not-allowed opacity-50" : ""}`}>Start</button>
                    <button onClick={actions.pause} className="dark-button">Pause</button>
                    <button onClick={() => actions.resetTimer(24)} className="dark-button">Reset Clock</button>
                    <button onClick={actions.undoBid} className="dark-button">Undo Bid</button>
                    </div>
                  </div>
                )}
                {adminTab === "result" && (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button onClick={() => actions.mark("Sold")} className="red-button">Mark Sold</button>
                    <button onClick={() => actions.mark("Unsold")} className="dark-button">Mark Unsold</button>
                    <button onClick={() => actions.nextLot(false)} className="dark-button">Next Player</button>
                    <button onClick={() => actions.nextLot(true)} className="dark-button">Re-auction Unsold</button>
                  </div>
                )}
                {adminTab === "links" && (
                  <div className="mt-5 space-y-3">
                    <LeagueModeLinks leagueId={state.league.id} mode={state.league.managementMode} live={state.league.status === "Live"} showAdmin />
                    <Link href="/admin" className="dark-button">Open Admin Dashboard</Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {mode !== "spectator" && (mode !== "admin" || allowAdminBids) && (mode !== "admin" || adminTab === "bid") && (
          <div className="glass-card p-4 sm:p-5">
            <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <div className="gold-kicker">{mode === "owner" ? "Owner Bidding Panel" : "Admin Bidding Panel"}</div>
                <p className="mt-1 text-sm text-arena-muted">Minimum next bid is Rs. {currentBid + bidIncrement}L. Type a manual amount or use the quick minimum button.</p>
              </div>
              {mode === "owner" && activeTeam && <div className="text-sm text-arena-gold">Remaining: Rs. {activeTeam.purse - activeTeam.spent}L</div>}
            </div>

            {mode === "admin" ? (
              <TeamTabs teams={leagueTeams} selectedTeam={selectedTeam} onSelect={setSelectedTeam} />
            ) : ownerTeamId && activeTeam ? (
              <div className="max-w-sm rounded-xl border border-arena-gold/20 bg-arena-gold/10 p-4">
                <div className="gold-kicker">Approved Team</div>
                <div className="mt-1 single-line text-lg font-semibold">{activeTeam.name}</div>
                <div className="text-sm text-arena-muted">{activeTeam.owner}</div>
              </div>
            ) : (
              <label className="block max-w-sm">
                <span className="mb-2 block text-sm font-semibold text-arena-muted">Logged in as team owner</span>
                <select value={ownerTeam} onChange={(event) => setOwnerTeam(event.target.value)} className="input-dark">
                  {leagueTeams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
              </label>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
              <label className="sm:col-span-1">
                <span className="mb-2 block text-sm font-semibold text-arena-muted">Bid amount</span>
                <input value={bidAmount} onChange={(event) => setBidAmount(Number(event.target.value))} className="input-dark" type="number" min={currentBid + 10} />
              </label>
              <button onClick={() => setBidAmount(currentBid + bidIncrement)} className="dark-button w-full">Use Minimum</button>
              <button onClick={submitBid} disabled={!canBid} className={`red-button w-full ${!canBid ? "cursor-not-allowed opacity-50" : ""}`}>Place Bid</button>
            </div>
          </div>
        )}

        {mode === "admin" && !allowAdminBids && (
          <div className="glass-card p-5">
            <div className="gold-kicker">Owner Bidding Active</div>
            <h2 className="mt-2 text-2xl font-semibold">Bids are placed from approved owner dashboards</h2>
            <p className="mt-2 text-sm text-arena-muted">
              Admin controls the timer, current player, sold/unsold decisions, undo, and lot flow. Owners place bids for their approved teams.
            </p>
          </div>
        )}

        {mode === "admin" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <button onClick={actions.resetDemo} className="dark-button">Reset Demo</button>
          </div>
        )}

        {mode === "owner" && (
          <div className="glass-card p-5">
            <div className="gold-kicker">Wishlist Players</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.slice(0, 6).map((player) => (
                <button key={player.id} onClick={() => actions.toggleWishlist(player.id)} className="rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-arena-red/40">
                  <div className="single-line font-semibold">{player.name}</div>
                  <div className="single-line text-xs text-arena-muted">{player.role} | Rs. {player.basePrice}L</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "spectator" && (
          <div className="grid gap-4 md:grid-cols-2">
            <ListPanel title="Recently Sold" items={soldPlayers.slice(-6).reverse().map((player) => `${player.name} - ${player.soldTo || "Team"} - Rs. ${player.soldPrice || player.basePrice}L`)} />
            <ListPanel title="Unsold Queue" items={unsoldPlayers.slice(0, 6).map((player) => `${player.name} - ${player.role}`)} />
          </div>
        )}
      </section>

      <aside className="space-y-5 min-w-0">
        <div className="glass-card p-4">
          <div className="gold-kicker">Team Purses</div>
          <div className="mt-4 space-y-3">
            {leagueTeams.length === 0 && <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-arena-muted">Teams will appear here after setup.</div>}
            {leagueTeams.map((team) => <TeamPurse key={team.id} team={team} />)}
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="gold-kicker">Bid History</div>
          <div className="mt-4 space-y-3">
            {state.bids.length === 0 && <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-arena-muted">No bids yet. Start the auction to begin bidding.</div>}
            {state.bids.slice(0, 8).map((bid) => (
              <div key={bid.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex justify-between gap-3 text-sm font-semibold"><span className="single-line">{bid.team}</span><span className="shrink-0 text-arena-gold">Rs. {bid.amount}L</span></div>
                <div className="mt-1 single-line text-xs text-arena-muted">{bid.player} | {bid.time}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function isImageSource(value?: string) {
  return Boolean(value?.startsWith("data:image") || value?.startsWith("http"));
}

function AuctionHeader({ status, timer, currentBid, leader, round }: { status: string; timer: number; currentBid: number; leader: string; round: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <InfoMetric label="Auction" value={status} />
      <InfoMetric label="Clock" value={`${timer}s`} gold />
      <InfoMetric label="Current Bid" value={`Rs. ${currentBid}L`} />
      <InfoMetric label={`Round ${round}`} value={leader} />
    </div>
  );
}

function InfoMetric({ label, value, gold = false }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="metric-card">
      <div className="single-line text-xs tracking-widest text-arena-muted">{label}</div>
      <div className={`single-line mt-1 text-lg font-semibold sm:text-2xl ${gold ? "text-arena-gold" : ""}`}>{value}</div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="single-line text-xs text-arena-muted">{label}</div>
      <div className="single-line font-semibold">{value}</div>
    </div>
  );
}

function BroadcastMetric({ label, value, gold = false }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
      <div className="single-line text-xs uppercase tracking-widest text-arena-muted">{label}</div>
      <div className={`single-line mt-1 text-2xl font-semibold ${gold ? "text-arena-gold" : ""}`}>{value}</div>
    </div>
  );
}

function TeamTabs({ teams, selectedTeam, onSelect }: { teams: { id: string; name: string; purse: number; spent: number; color: string }[]; selectedTeam: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {teams.map((team) => (
        <button
          key={team.id}
          onClick={() => onSelect(team.id)}
          className={`rounded-xl border p-3 text-left transition ${selectedTeam === team.id ? "border-arena-red bg-arena-red/15 text-white" : "border-white/10 bg-white/5 text-arena-muted hover:border-white/25"}`}
        >
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: team.color }} />
            <span className="single-line text-sm font-semibold">{team.name}</span>
          </span>
          <span className="mt-1 block single-line text-xs">Rs. {team.purse - team.spent}L left</span>
        </button>
      ))}
    </div>
  );
}

function AdminControlTabs({ active, onChange }: { active: "control" | "bid" | "result" | "links"; onChange: (tab: "control" | "bid" | "result" | "links") => void }) {
  const tabs: Array<["control" | "bid" | "result" | "links", string]> = [
    ["control", "Timer"],
    ["bid", "Bidding"],
    ["result", "Sold/Unsold"],
    ["links", "Links"]
  ];
  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-4">
      {tabs.map(([id, label]) => (
        <button key={id} onClick={() => onChange(id)} className={`rounded-full border px-3 py-2 text-sm font-semibold ${active === id ? "border-arena-red bg-arena-red/20 text-white" : "border-white/10 bg-white/5 text-arena-muted"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass-card p-5">
      <div className="gold-kicker">{title}</div>
      <div className="mt-4 space-y-2">
        {(items.length ? items : ["No entries yet"]).map((item) => (
          <div key={item} className="single-line rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-arena-muted">{item}</div>
        ))}
      </div>
    </div>
  );
}
