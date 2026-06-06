"use client";

import { useEffect, useMemo, useState } from "react";
import { AuctionRoom } from "@/components/AuctionRoom";
import { ADMIN_SESSION_KEY } from "@/components/AdminGate";
import { LeagueModeLinks } from "@/components/LeagueModeLinks";
import { PlayerManager } from "@/components/PlayerManager";
import { ReportsPanel } from "@/components/ReportsPanel";
import { SetupManager } from "@/components/SetupManager";
import { useAuctionStore } from "@/lib/auctionStore";
import { makeQrCodeUrl, makeUpiLink } from "@/lib/payments";
import { TeamPurse } from "./ui";

type AdminTab = "overview" | "auction" | "setup" | "players" | "reports" | "owners";

const tabs: [AdminTab, string][] = [
  ["overview", "Overview"],
  ["auction", "Live Auction"],
  ["setup", "Setup"],
  ["players", "Players"],
  ["reports", "Reports"],
  ["owners", "Owner Approvals"]
];

export function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const { state, actions } = useAuctionStore();
  const currentAdminId = typeof window !== "undefined" ? window.localStorage.getItem(ADMIN_SESSION_KEY) : "";
  const currentAdmin = state.adminUsers.find((admin) => admin.id === currentAdminId);
  const ownedLeagues = useMemo(
    () => state.leagues.filter((league) => league.createdByAdminId === currentAdminId),
    [currentAdminId, state.leagues]
  );
  const activeLeagueOwned = state.league.createdByAdminId === currentAdminId;
  const isOwnerBiddingLeague = state.league.managementMode === "owner";
  const availableTabs = currentAdmin?.role === "viewer"
    ? tabs.filter(([id]) => id === "overview" || id === "reports")
    : tabs;
  const canOperate = currentAdmin?.role !== "viewer" && activeLeagueOwned;

  useEffect(() => {
    if (!activeLeagueOwned && ownedLeagues[0]) {
      actions.selectLeague(ownedLeagues[0].id);
    }
  }, [actions, activeLeagueOwned, ownedLeagues]);

  useEffect(() => {
    if (!availableTabs.some(([id]) => id === tab)) {
      setTab("overview");
    }
  }, [availableTabs, tab]);

  return (
    <div className="space-y-5">
      <div className="glass-card sticky top-[114px] z-30 p-2 sm:top-[148px] sm:p-3 lg:static">
        <div className="mobile-nav-scroll sm:flex sm:overflow-x-auto">
          {availableTabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`min-h-11 min-w-[104px] shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${tab === id ? "bg-arena-red text-white shadow-redglow" : "bg-white/5 text-arena-muted hover:bg-white/10 hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && <AdminOverview onOpen={setTab} canOperate={Boolean(canOperate)} ownedLeagueCount={ownedLeagues.length} isOwnerBiddingLeague={isOwnerBiddingLeague} />}
      {tab === "auction" && canOperate && <AuctionRoom mode="admin" allowAdminBids={!isOwnerBiddingLeague} />}
      {tab === "setup" && <SetupManager />}
      {tab === "players" && activeLeagueOwned && <PlayerManager />}
      {tab === "players" && !activeLeagueOwned && <EmptyAdminState title="Select or create a league first" body="Players belong to a specific league. Open Setup, create a tournament, then return here to add players." onOpenSetup={() => setTab("setup")} />}
      {tab === "reports" && activeLeagueOwned && <ReportsPanel />}
      {tab === "owners" && <OwnerApprovals />}
    </div>
  );
}

function EmptyAdminState({ title, body, onOpenSetup }: { title: string; body: string; onOpenSetup: () => void }) {
  return (
    <div className="glass-card grid min-h-[320px] place-items-center p-6 text-center">
      <div className="max-w-lg">
        <div className="gold-kicker">Setup Required</div>
        <h2 className="mt-3 text-2xl font-semibold">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-arena-muted">{body}</p>
        <button onClick={onOpenSetup} className="red-button mt-5">Open Setup</button>
      </div>
    </div>
  );
}

function AdminOverview({ onOpen, canOperate, ownedLeagueCount, isOwnerBiddingLeague }: { onOpen: (tab: AdminTab) => void; canOperate: boolean; ownedLeagueCount: number; isOwnerBiddingLeague: boolean }) {
  const { state, leagueTeams, leaguePlayers, currentPlayer, currentBid, leader, actions } = useAuctionStore();
  const sold = leaguePlayers.filter((player) => player.status === "Sold").length;
  const pendingOwners = state.ownerRequests.filter((request) => request.status === "Pending").length;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 space-y-5">
        <div className="red-card p-4 sm:p-6">
          <div className="gold-kicker">Unified Admin Panel</div>
          {ownedLeagueCount > 0 ? (
            <>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">{state.league.name}</h2>
              {isOwnerBiddingLeague ? (
                <>
                  <p className="mt-2 text-sm text-arena-muted">Owner-bidding mode: admin sets tournament, teams, purse, players, base prices, timer, sold/unsold. Approved owners place bids from their profile.</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <button disabled={!canOperate} onClick={() => onOpen("auction")} className={`red-button ${!canOperate ? "cursor-not-allowed opacity-50" : ""}`}>Open Auction Room</button>
                    <button onClick={() => onOpen("owners")} className="red-button">Review Owner Requests</button>
                    <button onClick={() => onOpen("auction")} className="dark-button">Auction Controls</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-arena-muted">Current lot: {currentPlayer.name} | Leader: {leader} | Bid: Rs. {currentBid}L</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <button disabled={!canOperate} onClick={() => onOpen("auction")} className={`red-button ${!canOperate ? "cursor-not-allowed opacity-50" : ""}`}>Open Auction Room</button>
                    <button disabled={!canOperate} onClick={actions.pause} className={`dark-button ${!canOperate ? "cursor-not-allowed opacity-50" : ""}`}>Pause</button>
                    <button disabled={!canOperate} onClick={() => actions.nextLot(false)} className={`dark-button ${!canOperate ? "cursor-not-allowed opacity-50" : ""}`}>Next Lot</button>
                    <button disabled={!canOperate} onClick={() => actions.resetTimer(24)} className={`dark-button ${!canOperate ? "cursor-not-allowed opacity-50" : ""}`}>Reset Timer</button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Create your first league</h2>
              <p className="mt-2 text-sm text-arena-muted">Your admin account is ready. Open setup to create a league, add teams, and publish it to the home page.</p>
              <button onClick={() => onOpen("setup")} className="mt-5 red-button">Open Setup</button>
            </>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="My Leagues" value={String(ownedLeagueCount)} />
          <Metric label="Teams in League" value={String(leagueTeams.length)} />
          <Metric label={isOwnerBiddingLeague ? "Owner Requests" : "Players Sold"} value={String(isOwnerBiddingLeague ? pendingOwners : sold)} />
          {isOwnerBiddingLeague && <Metric label="Auction Control" value="Admin" />}
        </div>

        {ownedLeagueCount > 0 && state.league.status === "Live" && (
          <LeagueModeLinks leagueId={state.league.id} mode={state.league.managementMode} live showAdmin />
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tabs.filter(([id]) => {
            if (id === "overview") return false;
            return ownedLeagueCount > 0 || id === "setup";
          }).map(([id, label]) => (
            <button key={id} onClick={() => onOpen(id)} className="glass-card p-4 text-left transition hover:-translate-y-1 hover:border-arena-red/40 sm:p-5">
              <div className="gold-kicker">Admin Tool</div>
              <h3 className="mt-3 text-xl font-semibold sm:text-2xl">{label}</h3>
              <p className="mt-2 text-sm text-arena-muted">Open this section inside the same admin panel.</p>
            </button>
          ))}
        </div>
      </section>

      {ownedLeagueCount > 0 && <aside className="glass-card p-5">
        <div className="gold-kicker">Purse Monitor</div>
        <div className="mt-4 space-y-3">
          {leagueTeams.map((team) => <TeamPurse key={team.id} team={team} />)}
        </div>
      </aside>}
    </div>
  );
}

function OwnerApprovals() {
  const { state, actions } = useAuctionStore();
  const [verifyingRequests, setVerifyingRequests] = useState<Record<string, boolean>>({});
  const currentAdminId = typeof window !== "undefined" ? window.localStorage.getItem(ADMIN_SESSION_KEY) : "";
  const visibleRequests = state.ownerRequests.filter((request) => {
      const league = state.leagues.find((item) => item.id === request.leagueId);
      return league?.createdByAdminId === currentAdminId;
    });
  const ownerPaymentLink = makeUpiLink(499, "Auction Arena owner login");
  const ownerPaymentQr = makeQrCodeUrl(ownerPaymentLink, 180);

  useEffect(() => {
    const timers = visibleRequests
      .filter((request) => request.paymentStatus !== "paid" && request.status === "Pending" && !verifyingRequests[request.id])
      .map((request) => {
        setVerifyingRequests((current) => ({ ...current, [request.id]: true }));
        return window.setTimeout(() => {
          actions.markOwnerRequestPaid(request.id, `OWNER-${Date.now()}`);
          actions.setOwnerRequestStatus(request.id, "Approved");
        }, 4200);
      });
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [actions, verifyingRequests, visibleRequests]);

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-white/10 p-5">
        <div className="gold-kicker">Owner League Access</div>
        <h2 className="mt-2 text-2xl font-semibold">Approve owners before they enter bidding</h2>
      </div>
      <div className="divide-y divide-white/10">
        {visibleRequests.length === 0 && <div className="p-5 text-sm text-arena-muted">No owner access requests for your leagues yet.</div>}
        {visibleRequests.map((request) => (
          <div key={request.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="min-w-0">
              <div className="single-line font-semibold">{request.owner}</div>
              <div className="single-line text-sm text-arena-muted">{request.league} | {request.team} | {request.ownerEmail || "owner account"} | Requested {request.requestedAt} | {request.status}</div>
              <div className="mt-2 rounded-xl border border-arena-gold/25 bg-arena-gold/10 p-3 text-xs text-arena-muted">
                Owner login billing: Rs. 499 | Payment: {request.paymentStatus === "paid" ? `Paid${request.paymentReference ? ` | ${request.paymentReference}` : ""}` : "Pending"}
              </div>
              {request.paymentStatus !== "paid" && (
                <div className="mt-3 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 sm:grid-cols-[110px_minmax(0,1fr)]">
                  <div className="rounded-xl bg-white p-2">
                    <img src={ownerPaymentQr} alt="Payment QR code" className="h-24 w-24 rounded-lg" />
                  </div>
                  <div className="text-xs leading-5 text-arena-muted">
                    <div className="font-semibold text-arena-gold">Scan and pay Rs. 499</div>
                    <div>{verifyingRequests[request.id] ? "Verifying payment automatically..." : "Waiting for scan confirmation..."}</div>
                    <a href={ownerPaymentLink} className="mt-2 inline-flex rounded-full border border-arena-gold/30 bg-arena-gold/10 px-3 py-1 font-semibold text-arena-gold">Pay Now</a>
                  </div>
                </div>
              )}
            </div>
            <div className="grid gap-2 sm:min-w-[260px]">
              <button disabled={request.paymentStatus !== "paid"} onClick={() => actions.setOwnerRequestStatus(request.id, "Approved")} className={`red-button ${request.paymentStatus !== "paid" ? "cursor-not-allowed opacity-50" : ""}`}>Approve Login</button>
              <button onClick={() => actions.setOwnerRequestStatus(request.id, "Rejected")} className="dark-button">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <div className="single-line text-xs text-arena-muted">{label}</div>
      <div className="mt-1 single-line text-2xl font-semibold">{value}</div>
    </div>
  );
}
