"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { ADMIN_SESSION_KEY } from "@/components/AdminGate";
import { useAuctionStore } from "@/lib/auctionStore";
import { prepareImageUpload } from "@/lib/imageUpload";

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
  const [bidIncrement, setBidIncrement] = useState(state.league.bidIncrement || 10);
  const [maxTeams, setMaxTeams] = useState(state.league.maxTeams || 8);
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState(state.league.maxPlayersPerTeam || 16);
  const [ownerApprovalRequired, setOwnerApprovalRequired] = useState(state.league.ownerApprovalRequired ?? true);
  const [teamName, setTeamName] = useState("");
  const [owner, setOwner] = useState("");
  const [teamLogo, setTeamLogo] = useState("");
  const [logoMessage, setLogoMessage] = useState("");
  const [newLeagueName, setNewLeagueName] = useState("");
  const [newLeagueSport, setNewLeagueSport] = useState("Cricket");
  const [newLeagueMode, setNewLeagueMode] = useState<"admin" | "owner">("owner");
  const [newLeagueVisibility, setNewLeagueVisibility] = useState<"public" | "private">("public");
  const [newLeagueRegistration, setNewLeagueRegistration] = useState<"Open" | "Draft">("Open");

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
    setBidIncrement(state.league.bidIncrement || 10);
    setMaxTeams(state.league.maxTeams || 8);
    setMaxPlayersPerTeam(state.league.maxPlayersPerTeam || 16);
    setOwnerApprovalRequired(state.league.ownerApprovalRequired ?? true);
  }, [actions, activeLeagueOwned, ownedLeagues, state.league.auctionFormat, state.league.bidIncrement, state.league.managementMode, state.league.maxPlayersPerTeam, state.league.maxTeams, state.league.name, state.league.ownerApprovalRequired, state.league.purse, state.league.registrationMode, state.league.registrationStatus, state.league.sport, state.league.visibility]);

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
      bidIncrement: Number(bidIncrement) || 10,
      maxTeams: Math.max(FREE_TEAM_LIMIT, Number(maxTeams) || FREE_TEAM_LIMIT),
      maxPlayersPerTeam: Number(maxPlayersPerTeam) || 16,
      ownerApprovalRequired
    });
  }

  function addTeam() {
    if (!teamName.trim() || !owner.trim() || !activeLeagueOwned) return;
    if (teamLimitReached) return;
    actions.addTeam({ name: teamName.trim(), owner: owner.trim(), color: "#E50914", logo: teamLogo });
    setTeamName("");
    setOwner("");
    setTeamLogo("");
  }

  function addLeague() {
    if (!newLeagueName.trim()) return;
    const adminId = typeof window !== "undefined" ? window.localStorage.getItem(ADMIN_SESSION_KEY) : "";
    const admin = state.adminUsers.find((item) => item.id === adminId) || currentAdmin || state.adminUsers[0];
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
      createdByAdminId: admin.id,
      createdByAdminName: admin.name,
      purse: 1000,
      sponsor: "TITLE SPONSOR"
    });
    setNewLeagueName("");
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
              ["2", "Open registration", "Let owners request access while admin reviews."],
              ["3", "Add teams and players", "Set purse, base prices, roles and photos."],
              ["4", "Start auction", "Set up freely. At auction start, admin-managed leagues pay Rs. 99 per team after 3. Owner-bidding leagues charge Rs. 499 per approved owner login."],
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
                  <option value="Open">Open for owner requests</option>
                  <option value="Draft">Draft until published</option>
                </select>
              </label>
            </div>
            <button onClick={addLeague} className="red-button w-full">Create Tournament Free</button>
            <p className="text-xs leading-5 text-arena-muted">
              Create and set up unlimited tournaments without payment. Admin-managed billing is checked when the auction starts. Owner-bidding login payments are checked during owner approval.
            </p>
          </div>
        </div>

        {activeLeagueOwned && (
        <div className="glass-card p-5">
          <div className="gold-kicker">Tournament Details</div>
          {isAdminManagedLeague && (
            <div className="mt-3 rounded-xl border border-arena-gold/25 bg-arena-gold/10 p-3 text-sm text-arena-muted">
              Admin-managed billing: {FREE_TEAM_LIMIT} teams free, {extraTeamsDue} extra team{extraTeamsDue === 1 ? "" : "s"} added, Rs. {setupPaymentDue} due before auction start.
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
            {isAdminManagedLeague && currentLeagueTeams.length > FREE_TEAM_LIMIT && (
              <div className="rounded-xl border border-arena-red/25 bg-arena-red/10 p-3 text-sm text-arena-muted">
                Payment will be requested when the auction starts: Rs. {ADMIN_EXTRA_TEAM_PRICE} x {extraTeamsDue} extra team{extraTeamsDue === 1 ? "" : "s"} = Rs. {setupPaymentDue}.
              </div>
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
              <ChecklistItem label={isAdminManagedLeague ? `Start payment due Rs. ${setupPaymentDue}` : "Owner approvals billable"} done={!isAdminManagedLeague || setupPaymentDue === 0} />
              <ChecklistItem label="Players ready" done={leaguePlayers.length > 0} />
            </div>
          </div>
        )}
        {state.teams.map((team) => (
          <div key={team.id} className="glass-card p-5">
            <div className="flex items-center gap-3">
              {team.logo ? (
                <img src={team.logo} alt={team.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded-xl" style={{ background: team.color }} />
              )}
              <div className="min-w-0">
                <h2 className="single-line font-semibold">{team.name}</h2>
                <p className="text-sm text-arena-muted">{team.owner}</p>
                <p className="mt-1 text-xs text-arena-gold">Purse Rs. {team.purse}L | Squad {team.squad}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {ownedLeagues.map((item) => {
                const active = (team.leagueIds || []).includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => actions.toggleTeamLeague(team.id, item.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${active ? "border-arena-red bg-arena-red/15 text-white" : "border-white/10 bg-white/5 text-arena-muted"}`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
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
