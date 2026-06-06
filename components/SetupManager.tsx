"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { ADMIN_SESSION_KEY } from "@/components/AdminGate";
import { useAuctionStore } from "@/lib/auctionStore";
import type { Team } from "@/lib/data";
import { prepareImageUpload } from "@/lib/imageUpload";
import { makeQrCodeUrl, makeUpiLink } from "@/lib/payments";

const FREE_TEAM_LIMIT = 3;
const ADMIN_EXTRA_TEAM_PRICE = 99;
const OWNER_LOGIN_PRICE = 499;

export function SetupManager() {
  const { state, leaguePlayers, actions } = useAuctionStore();
  const currentAdminId = typeof window !== "undefined" ? window.localStorage.getItem(ADMIN_SESSION_KEY) : "";
  const currentAdmin = state.adminUsers.find((item) => item.id === currentAdminId);
  const ownedLeagues = useMemo(
    () => state.leagues.filter((item) => item.createdByAdminId === currentAdminId),
    [currentAdminId, state.leagues]
  );
  const activeLeagueOwned = state.league.createdByAdminId === currentAdminId;
  const currentLeagueTeams = state.teams.filter((team) => (team.leagueIds || []).includes(state.currentLeagueId));
  const isAdminManagedLeague = state.league.managementMode === "admin";
  const paidTeamSlots = Number(state.league.paidTeamSlots) || 0;
  const extraTeamsDue = isAdminManagedLeague ? Math.max(0, currentLeagueTeams.length - FREE_TEAM_LIMIT) : 0;
  const teamLimitReached = currentLeagueTeams.length >= (Number(state.league.maxTeams) || 99);
  const [league, setLeague] = useState(state.league.name);
  const [sport, setSport] = useState(state.league.sport);
  const [purse, setPurse] = useState(state.league.purse);
  const [managementMode, setManagementMode] = useState(state.league.managementMode);
  const [visibility, setVisibility] = useState(state.league.visibility || "public");
  const [registrationStatus, setRegistrationStatus] = useState(state.league.registrationStatus || "Open");
  const [registrationMode, setRegistrationMode] = useState(state.league.registrationMode || "teams");
  const [auctionFormat, setAuctionFormat] = useState(state.league.auctionFormat || "open");
  const [auctionOrder, setAuctionOrder] = useState(state.league.auctionOrder || "sequence");
  const [bidIncrement, setBidIncrement] = useState(state.league.bidIncrement || 10);
  const [maxTeams, setMaxTeams] = useState(state.league.maxTeams || 8);
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState(state.league.maxPlayersPerTeam || 16);
  const [ownerApprovalRequired, setOwnerApprovalRequired] = useState(state.league.ownerApprovalRequired ?? true);
  const [sponsor, setSponsor] = useState(state.league.sponsor);
  const [teamName, setTeamName] = useState("");
  const [owner, setOwner] = useState("");
  const [teamLogo, setTeamLogo] = useState("");
  const [logoMessage, setLogoMessage] = useState("");
  const [setupMessage, setSetupMessage] = useState("");
  const [newLeagueName, setNewLeagueName] = useState("");
  const [newLeagueSport, setNewLeagueSport] = useState("Cricket");
  const [newLeagueMode, setNewLeagueMode] = useState<"admin" | "owner">("owner");
  const [newLeagueVisibility, setNewLeagueVisibility] = useState<"public" | "private">("public");
  const [newLeagueRegistration, setNewLeagueRegistration] = useState<"Open" | "Draft">("Draft");
  const [editingTeamId, setEditingTeamId] = useState("");
  const [pendingTeam, setPendingTeam] = useState<{ name: string; owner: string; logo?: string } | null>(null);
  const [teamPaymentState, setTeamPaymentState] = useState<"idle" | "scan">("idle");
  const [teamPaymentReference, setTeamPaymentReference] = useState("");

  useEffect(() => {
    if (!activeLeagueOwned && ownedLeagues[0]) {
      actions.selectLeague(ownedLeagues[0].id);
      return;
    }
    setLeague(state.league.name);
    setSport(state.league.sport);
    setPurse(state.league.purse);
    setManagementMode(state.league.managementMode);
    setVisibility(state.league.visibility || "public");
    setRegistrationStatus(state.league.registrationStatus || "Open");
    setRegistrationMode(state.league.registrationMode || "teams");
    setAuctionFormat(state.league.auctionFormat || "open");
    setAuctionOrder(state.league.auctionOrder || "sequence");
    setBidIncrement(state.league.bidIncrement || 10);
    setMaxTeams(state.league.maxTeams || 8);
    setMaxPlayersPerTeam(state.league.maxPlayersPerTeam || 16);
    setOwnerApprovalRequired(state.league.ownerApprovalRequired ?? true);
    setSponsor(state.league.sponsor);
  }, [actions, activeLeagueOwned, ownedLeagues, state.league.auctionFormat, state.league.auctionOrder, state.league.bidIncrement, state.league.managementMode, state.league.maxPlayersPerTeam, state.league.maxTeams, state.league.name, state.league.ownerApprovalRequired, state.league.purse, state.league.registrationMode, state.league.registrationStatus, state.league.sponsor, state.league.sport, state.league.visibility]);

  async function readTeamLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoMessage("Preparing image...");
    try {
      setTeamLogo(await prepareImageUpload(file, 360));
      setLogoMessage("Logo optimized and ready.");
    } catch (error) {
      setTeamLogo("");
      setLogoMessage(error instanceof Error ? error.message : "Logo could not be uploaded.");
    }
  }

  function saveLeague() {
    if (!activeLeagueOwned) return;
    actions.updateLeague({
      name: league || state.league.name,
      sport: sport || "Cricket",
      purse: Number(purse) || 1200,
      managementMode,
      visibility,
      registrationStatus,
      registrationMode,
      auctionFormat,
      auctionOrder,
      bidIncrement: Number(bidIncrement) || 10,
      maxTeams: Math.max(FREE_TEAM_LIMIT, Number(maxTeams) || FREE_TEAM_LIMIT),
      maxPlayersPerTeam: Number(maxPlayersPerTeam) || 16,
      ownerApprovalRequired,
      sponsor: sponsor || "TITLE SPONSOR"
    });
  }

  function addTeam() {
    if (!teamName.trim() || !owner.trim() || !activeLeagueOwned) return;
    if (teamLimitReached) return;
    const nextTeamCount = currentLeagueTeams.length + 1;
    const paidSlots = Number(state.league.paidTeamSlots) || 0;
    const extraSlotsAfterAdd = isAdminManagedLeague ? Math.max(0, nextTeamCount - FREE_TEAM_LIMIT) : 0;
    const needsSlotPayment = isAdminManagedLeague && extraSlotsAfterAdd > paidSlots;
    if (needsSlotPayment) {
      setPendingTeam({ name: teamName.trim(), owner: owner.trim(), logo: teamLogo });
      setTeamPaymentState("scan");
      return;
    }
    commitTeam(teamName.trim(), owner.trim(), teamLogo);
  }

  const commitTeam = useCallback((nextName: string, nextOwner: string, nextLogo?: string) => {
    actions.addTeam({ name: nextName, owner: nextOwner, color: "#E50914", logo: nextLogo });
    setTeamName("");
    setOwner("");
    setTeamLogo("");
  }, [actions]);

  function confirmTeamPayment() {
    if (!pendingTeam) return;
    if (teamPaymentReference.trim().length < 4) return;
    const nextPaidSlots = Math.max(Number(state.league.paidTeamSlots) || 0, Math.max(1, currentLeagueTeams.length + 1 - FREE_TEAM_LIMIT));
    actions.markLeaguePaid(teamPaymentReference.trim(), nextPaidSlots);
    commitTeam(pendingTeam.name, pendingTeam.owner, pendingTeam.logo);
    setPendingTeam(null);
    setTeamPaymentReference("");
    setTeamPaymentState("idle");
  }

  function cancelTeamPayment() {
    setPendingTeam(null);
    setTeamPaymentReference("");
    setTeamPaymentState("idle");
  }

  function addLeague() {
    if (!newLeagueName.trim()) {
      setSetupMessage("Enter a tournament name first.");
      return;
    }
    const adminId = typeof window !== "undefined" ? window.localStorage.getItem(ADMIN_SESSION_KEY) || "" : "";
    if (!adminId && !currentAdmin) {
      setSetupMessage("Login as admin again before creating a tournament.");
      return;
    }
    const admin = state.adminUsers.find((item) => item.id === adminId) || currentAdmin;
    const createdByAdminId = admin?.id || adminId;
    const createdByAdminName = admin?.name || "Auction Admin";
    actions.addLeague({
      name: newLeagueName.trim(),
      sport: newLeagueSport.trim() || "Cricket",
      managementMode: newLeagueMode,
      accessType: "paid",
      visibility: newLeagueVisibility,
      registrationStatus: newLeagueRegistration,
      registrationMode: "teams",
      auctionFormat: "open",
      bidIncrement: 10,
      maxTeams: 8,
      maxPlayersPerTeam: 16,
      ownerApprovalRequired: true,
      createdByAdminId,
      createdByAdminName,
      purse: 1000,
      sponsor: "TITLE SPONSOR"
    });
    setNewLeagueName("");
    setSetupMessage("Tournament created. Add teams and players next.");
  }

  const setupPaymentDue = Math.max(0, extraTeamsDue - paidTeamSlots) * ADMIN_EXTRA_TEAM_PRICE;

  return (
    <div className="grid gap-5 xl:grid-cols-[460px_1fr]">
      <div className="space-y-5">
        <div className="red-card p-5">
          <div className="gold-kicker">Setup Flow</div>
          <h2 className="mt-2 text-2xl font-semibold">Create, register, approve, auction</h2>
          <div className="mt-4 grid gap-2">
            {[
              ["1", "Create tournament", "Name, sport, visibility and management mode."],
              ["2", "Register teams", "First 3 admin-managed teams are included. The 4th and later teams open the scan-to-pay step immediately."],
              ["3", "Build player pool", "Upload players, photos, roles, base prices and stats."],
              ["4", "Run auction", "Share owner, spectator and projector links once the tournament is ready."],
            ].map(([step, title, body]) => (
              <div key={step} className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-3 sm:grid-cols-[34px_minmax(0,1fr)]">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-arena-red text-xs font-semibold text-white">{step}</div>
                <div>
                  <div className="font-semibold">{title}</div>
                  <p className="text-xs leading-5 text-arena-muted">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="gold-kicker">Tournament Workspace</div>
          <div className="mt-5 space-y-4">
            {ownedLeagues.length > 0 ? (
              <select className="input-dark" value={activeLeagueOwned ? state.currentLeagueId : ownedLeagues[0].id} onChange={(event) => actions.selectLeague(event.target.value)}>
                {ownedLeagues.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            ) : (
              <div className="rounded-xl border border-arena-gold/25 bg-arena-gold/10 p-4 text-sm text-arena-muted">
                You do not have a league yet. Create one below and it will appear on the public home page.
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <input aria-label="New league name" className="input-dark" placeholder="New league name" value={newLeagueName} onChange={(event) => setNewLeagueName(event.target.value)} />
              <input aria-label="New league sport" className="input-dark" placeholder="Sport" value={newLeagueSport} onChange={(event) => setNewLeagueSport(event.target.value)} />
            </div>
            <div className="grid gap-3">
              <div className="gold-kicker">How should this tournament be managed?</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setNewLeagueMode("admin")}
                  className={`rounded-2xl border p-4 text-left transition ${newLeagueMode === "admin" ? "border-arena-red bg-arena-red/15" : "border-white/10 bg-white/5"}`}
                >
                  <div className="font-semibold">Admin Managed</div>
                  <p className="mt-2 text-sm text-arena-muted">Admin sets everything and places bids/control actions from the live auction panel.</p>
                </button>
                <button
                  onClick={() => setNewLeagueMode("owner")}
                  className={`rounded-2xl border p-4 text-left transition ${newLeagueMode === "owner" ? "border-arena-red bg-arena-red/15" : "border-white/10 bg-white/5"}`}
                >
                  <div className="font-semibold">Owner Bidding</div>
                  <p className="mt-2 text-sm text-arena-muted">Admin sets teams, purse, players, timer and sold/unsold. Approved owners place bids.</p>
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-arena-muted">Visibility</span>
                <select className="input-dark" value={newLeagueVisibility} onChange={(event) => setNewLeagueVisibility(event.target.value as "public" | "private")}>
                  <option value="public">Public directory</option>
                  <option value="private">Private invite</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-arena-muted">Registration</span>
                <select className="input-dark" value={newLeagueRegistration} onChange={(event) => setNewLeagueRegistration(event.target.value as "Open" | "Draft")}>
                  <option value="Draft">Draft until published</option>
                  <option value="Open">Open for owner requests</option>
                </select>
              </label>
            </div>
            <button onClick={addLeague} className="red-button w-full">Create Tournament</button>
            {setupMessage && <p className="rounded-xl border border-arena-gold/25 bg-arena-gold/10 p-3 text-sm text-arena-muted">{setupMessage}</p>}
            <p className="text-xs leading-5 text-arena-muted">
              Admin-managed tournaments include 3 teams. Adding the 4th team opens the scan-to-pay step before that team is saved. Owner-bidding login payments are checked during owner approval.
            </p>
          </div>
        </div>

        {activeLeagueOwned && (
        <div className="glass-card p-5">
          <div className="gold-kicker">Tournament Details</div>
          {isAdminManagedLeague && (
            <div className="mt-3 rounded-xl border border-arena-gold/25 bg-arena-gold/10 p-3 text-sm text-arena-muted">
              Admin-managed billing: {FREE_TEAM_LIMIT} teams included, {extraTeamsDue} extra team{extraTeamsDue === 1 ? "" : "s"} added, Rs. {setupPaymentDue} pending for additional team slots.
            </div>
          )}
          {!isAdminManagedLeague && (
            <div className="mt-3 rounded-xl border border-arena-red/25 bg-arena-red/10 p-3 text-sm text-arena-muted">
              Owner-bidding billing: team setup is managed here, and each approved owner login is billed at Rs. {OWNER_LOGIN_PRICE}.
            </div>
          )}
          <div className="mt-5 space-y-4">
            <input aria-label="League name" className="input-dark" value={league} onChange={(event) => setLeague(event.target.value)} />
            <input aria-label="Sport" className="input-dark" value={sport} onChange={(event) => setSport(event.target.value)} />
            <input aria-label="Sponsor" className="input-dark" value={sponsor} onChange={(event) => setSponsor(event.target.value)} />
            <input aria-label="Purse" className="input-dark" type="number" value={purse} onChange={(event) => setPurse(Number(event.target.value))} />
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-arena-muted">Visibility</span>
                <select className="input-dark" value={visibility} onChange={(event) => setVisibility(event.target.value as "public" | "private")}>
                  <option value="public">Public directory</option>
                  <option value="private">Private invite</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-arena-muted">Registration status</span>
                <select className="input-dark" value={registrationStatus} onChange={(event) => setRegistrationStatus(event.target.value as "Draft" | "Open" | "Closed")}>
                  <option value="Draft">Draft</option>
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setAuctionOrder("sequence")}
                className={`rounded-xl border p-3 text-left text-sm font-semibold ${auctionOrder === "sequence" ? "border-arena-red bg-arena-red/15" : "border-white/10 bg-white/5 text-arena-muted"}`}
              >
                Default player order: Sequence
              </button>
              <button
                onClick={() => setAuctionOrder("random")}
                className={`rounded-xl border p-3 text-left text-sm font-semibold ${auctionOrder === "random" ? "border-arena-red bg-arena-red/15" : "border-white/10 bg-white/5 text-arena-muted"}`}
              >
                Default player order: Random
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold text-arena-muted">Registration type</span>
                <select className="input-dark" value={registrationMode} onChange={(event) => setRegistrationMode(event.target.value as "teams" | "players" | "invite")}>
                  <option value="teams">Team registration</option>
                  <option value="players">Player registration</option>
                  <option value="invite">Invite only</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-arena-muted">Auction format</span>
                <select className="input-dark" value={auctionFormat} onChange={(event) => setAuctionFormat(event.target.value as "open" | "sealed" | "hybrid")}>
                  <option value="open">Open bidding</option>
                  <option value="sealed">Sealed bid preview</option>
                  <option value="hybrid">Hybrid rounds</option>
                </select>
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label>
                <span className="mb-2 block text-sm font-semibold text-arena-muted">Bid increment</span>
                <input aria-label="Bid increment" className="input-dark" type="number" value={bidIncrement} onChange={(event) => setBidIncrement(Number(event.target.value))} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-arena-muted">Max teams</span>
                <input aria-label="Max teams" className="input-dark" type="number" value={maxTeams} onChange={(event) => setMaxTeams(Number(event.target.value))} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-arena-muted">Squad size</span>
                <input aria-label="Squad size" className="input-dark" type="number" value={maxPlayersPerTeam} onChange={(event) => setMaxPlayersPerTeam(Number(event.target.value))} />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setManagementMode("admin")}
                className={`rounded-xl border p-3 text-left text-sm font-semibold ${managementMode === "admin" ? "border-arena-red bg-arena-red/15" : "border-white/10 bg-white/5 text-arena-muted"}`}
              >
                Admin Managed
              </button>
              <button
                onClick={() => setManagementMode("owner")}
                className={`rounded-xl border p-3 text-left text-sm font-semibold ${managementMode === "owner" ? "border-arena-red bg-arena-red/15" : "border-white/10 bg-white/5 text-arena-muted"}`}
              >
                Owner Bidding + Approval
              </button>
            </div>
            <button
              onClick={() => setOwnerApprovalRequired(!ownerApprovalRequired)}
              className={`rounded-xl border p-3 text-left text-sm font-semibold ${ownerApprovalRequired ? "border-arena-red bg-arena-red/15" : "border-white/10 bg-white/5 text-arena-muted"}`}
            >
              {ownerApprovalRequired ? "Admin approval required for owners" : "Owners can enter after registration"}
            </button>
            <button onClick={saveLeague} className="red-button w-full">Save Tournament</button>
          </div>
        </div>
        )}

        {activeLeagueOwned && (
        <div className="glass-card p-5">
          <div className="gold-kicker">Add Team</div>
          <div className="mt-5 space-y-4">
            {teamLimitReached && (
              <div className="rounded-xl border border-arena-gold/25 bg-arena-gold/10 p-3 text-sm text-arena-muted">
                This tournament is capped at {state.league.maxTeams || maxTeams} teams.
              </div>
            )}
            {isAdminManagedLeague && currentLeagueTeams.length >= FREE_TEAM_LIMIT && (
              <div className="rounded-xl border border-arena-gold/25 bg-arena-gold/10 p-3 text-sm text-arena-muted">
                The next team unlocks after scanning a Rs. {ADMIN_EXTRA_TEAM_PRICE} payment QR.
              </div>
            )}
            {teamPaymentState !== "idle" && pendingTeam && (
              <TeamSlotPayment
                amount={ADMIN_EXTRA_TEAM_PRICE}
                teamName={pendingTeam.name}
                reference={teamPaymentReference}
                onReferenceChange={setTeamPaymentReference}
                onConfirm={confirmTeamPayment}
                onCancel={cancelTeamPayment}
              />
            )}
            <input aria-label="Team name" className="input-dark" placeholder="Team name" value={teamName} onChange={(event) => setTeamName(event.target.value)} />
            <input aria-label="Owner name" className="input-dark" placeholder="Owner name" value={owner} onChange={(event) => setOwner(event.target.value)} />
            <label className="block rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="block text-sm font-semibold text-arena-muted">Team logo</span>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input aria-label="Upload team logo" type="file" accept="image/*" onChange={readTeamLogo} className="block w-full text-sm text-arena-muted file:mr-4 file:rounded-full file:border-0 file:bg-arena-red file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
                {teamLogo && <img src={teamLogo} alt="Team logo preview" className="h-14 w-14 shrink-0 rounded-xl object-cover" />}
              </div>
              {logoMessage && <span className="mt-2 block text-xs text-arena-muted">{logoMessage}</span>}
            </label>
            <button disabled={teamLimitReached} onClick={addTeam} className={`dark-button w-full ${teamLimitReached ? "cursor-not-allowed opacity-50" : ""}`}>
              Add Team
            </button>
          </div>
        </div>
        )}
      </div>

      <div className="grid content-start gap-4 md:grid-cols-2">
        {activeLeagueOwned && (
          <div className="red-card p-5 md:col-span-2">
            <div className="gold-kicker">Launch Checklist</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ChecklistItem label="Tournament created" done={Boolean(state.league.name && activeLeagueOwned)} />
              <ChecklistItem label="Registration open" done={state.league.registrationStatus === "Open"} />
              <ChecklistItem label={isAdminManagedLeague ? `Included teams ${Math.min(currentLeagueTeams.length, FREE_TEAM_LIMIT)}/${FREE_TEAM_LIMIT}` : `Owner login Rs. ${OWNER_LOGIN_PRICE}`} done={!isAdminManagedLeague || currentLeagueTeams.length >= FREE_TEAM_LIMIT} />
              <ChecklistItem label={isAdminManagedLeague ? `Extra slots paid ${paidTeamSlots}` : "Owner approvals billable"} done={!isAdminManagedLeague || setupPaymentDue === 0} />
              <ChecklistItem label="Players ready" done={leaguePlayers.length > 0} />
            </div>
          </div>
        )}
        {currentLeagueTeams.map((team) => (
          <div key={team.id} className="glass-card p-5">
            {editingTeamId === team.id ? (
              <EditableTeam team={team} onCancel={() => setEditingTeamId("")} onSave={(next) => { actions.updateTeam(team.id, next); setEditingTeamId(""); }} />
            ) : (
              <>
                <div className="flex items-center gap-3">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-xl" style={{ background: team.color }} />
                  )}
                  <div className="min-w-0">
                    <h2 className="single-line font-semibold">{team.name}</h2>
                    <p className="text-sm text-arena-muted">{team.owner}</p>
                    <p className="mt-1 text-xs text-arena-gold">Purse Rs. {team.purse}L | Spent Rs. {team.spent}L | Squad {team.squad}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ownedLeagues.map((item) => {
                    const active = (team.leagueIds || []).includes(item.id);
                    const targetTeams = state.teams.filter((entry) => (entry.leagueIds || []).includes(item.id));
                    const targetPaidSlots = Number(item.paidTeamSlots) || 0;
                    const needsPaidSlot = !active && item.managementMode === "admin" && Math.max(0, targetTeams.length + 1 - FREE_TEAM_LIMIT) > targetPaidSlots;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (needsPaidSlot) return;
                          actions.toggleTeamLeague(team.id, item.id);
                        }}
                        disabled={needsPaidSlot}
                        title={needsPaidSlot ? "Adding this team needs a paid team slot. Select that league and use Add Team." : item.name}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${active ? "border-arena-red bg-arena-red/15 text-white" : needsPaidSlot ? "cursor-not-allowed border-arena-gold/25 bg-arena-gold/10 text-arena-muted opacity-60" : "border-white/10 bg-white/5 text-arena-muted"}`}
                      >
                        {item.name}{needsPaidSlot ? " | payment needed" : ""}
                      </button>
                    );
                  })}
                  <button onClick={() => setEditingTeamId(team.id)} className="rounded-full border border-arena-gold/30 bg-arena-gold/10 px-3 py-1 text-xs font-semibold text-arena-gold">Edit Team</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamSlotPayment({ amount, teamName, reference, onReferenceChange, onConfirm, onCancel }: { amount: number; teamName: string; reference: string; onReferenceChange: (value: string) => void; onConfirm: () => void; onCancel: () => void }) {
  const paymentLink = makeUpiLink(amount, `Auction Arena team slot ${teamName}`);
  const qrCodeUrl = makeQrCodeUrl(paymentLink, 220);
  const canConfirm = reference.trim().length >= 4;
  return (
    <div className="rounded-2xl border border-arena-gold/30 bg-arena-gold/10 p-4">
      <div className="gold-kicker">Team Slot Payment</div>
      <h3 className="mt-2 text-xl font-semibold">Scan to add {teamName}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
        <div className="rounded-2xl bg-white p-3">
          <img src={qrCodeUrl} alt="Payment QR code" className="h-40 w-40 rounded-xl" />
        </div>
        <div className="text-sm leading-6 text-arena-muted">
          <div className="text-2xl font-semibold text-arena-gold">Rs. {amount}</div>
          <p className="mt-2">This team will not be saved until the payment step is completed. Use Pay Now on mobile or scan the QR on another device.</p>
          <input
            aria-label="Payment reference"
            className="input-dark mt-4"
            placeholder="Enter payment reference"
            value={reference}
            onChange={(event) => onReferenceChange(event.target.value)}
          />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <a href={paymentLink} className="dark-button w-full">Pay Now</a>
            <button onClick={onConfirm} disabled={!canConfirm} className={`red-button w-full ${!canConfirm ? "cursor-not-allowed opacity-50" : ""}`}>Payment Done</button>
          </div>
          {!canConfirm && <div className="mt-2 text-xs text-arena-muted">Enter the payment reference to unlock this team slot.</div>}
          <button onClick={onCancel} className="mt-2 w-full text-sm font-semibold text-arena-muted transition hover:text-white">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function EditableTeam({ team, onCancel, onSave }: { team: Team; onCancel: () => void; onSave: (team: Partial<Team>) => void }) {
  const [name, setName] = useState(team.name);
  const [owner, setOwner] = useState(team.owner);
  const [purse, setPurse] = useState(team.purse);
  const [spent, setSpent] = useState(team.spent);
  const [squad, setSquad] = useState(team.squad);
  const [color, setColor] = useState(team.color);
  const [registrationStatus, setRegistrationStatus] = useState(team.registrationStatus || "Approved");

  return (
    <div className="space-y-3">
      <div className="gold-kicker">Edit Team</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input aria-label="Edit team name" className="input-dark" value={name} onChange={(event) => setName(event.target.value)} />
        <input aria-label="Edit team owner" className="input-dark" value={owner} onChange={(event) => setOwner(event.target.value)} />
        <input aria-label="Edit team purse" className="input-dark" type="number" value={purse} onChange={(event) => setPurse(Number(event.target.value))} />
        <input aria-label="Edit team spent" className="input-dark" type="number" value={spent} onChange={(event) => setSpent(Number(event.target.value))} />
        <input aria-label="Edit team squad" className="input-dark" type="number" value={squad} onChange={(event) => setSquad(Number(event.target.value))} />
        <input aria-label="Edit team color" className="input-dark" type="color" value={color} onChange={(event) => setColor(event.target.value)} />
        <select aria-label="Edit team approval" className="input-dark sm:col-span-2" value={registrationStatus} onChange={(event) => setRegistrationStatus(event.target.value as NonNullable<Team["registrationStatus"]>)}>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={() => onSave({ name: name.trim() || team.name, owner: owner.trim() || team.owner, purse: Number(purse) || 0, spent: Number(spent) || 0, squad: Number(squad) || 0, color, registrationStatus })} className="red-button">Save Team</button>
        <button onClick={onCancel} className="dark-button">Cancel</button>
      </div>
    </div>
  );
}

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className={`rounded-xl border p-3 text-sm font-semibold ${done ? "border-arena-red/30 bg-arena-red/15 text-white" : "border-white/10 bg-white/5 text-arena-muted"}`}>
      {done ? "Ready" : "Pending"} | {label}
    </div>
  );
}
