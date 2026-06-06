"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuctionRoom } from "@/components/AuctionRoom";
import { useAuctionStore } from "@/lib/auctionStore";
import { withBasePath } from "@/lib/routes";
import { useSupabaseAuth } from "@/lib/useSupabaseAuth";

const SESSION_KEY = "bidarena-owner-account-session-v1";

export function OwnerGate({ leagueId: scopedLeagueId }: { leagueId?: string }) {
  const router = useRouter();
  const { state, actions } = useAuctionStore();
  const auth = useSupabaseAuth("owner");
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [message, setMessage] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [activeEntry, setActiveEntry] = useState<{ leagueId: string; teamId: string } | null>(null);
  const [teamByLeague, setTeamByLeague] = useState<Record<string, string>>({});

  useEffect(() => {
    setOwnerId(window.localStorage.getItem(SESSION_KEY) || "");
  }, []);

  useEffect(() => {
    if (!auth.enabled || !auth.profile) return;
    const ownerUser = {
      id: auth.profile.id,
      name: auth.profile.name,
      email: auth.profile.email,
      password: "Supabase auth",
      status: auth.profile.status,
      createdAt: new Date().toLocaleDateString()
    };
    actions.syncOwnerUser(ownerUser);
    window.localStorage.setItem(SESSION_KEY, auth.profile.id);
    setOwnerId(auth.profile.id);
  }, [actions, auth.enabled, auth.profile]);

  const owner = useMemo(
    () => {
      if (auth.enabled && auth.profile?.role === "owner" && auth.profile.status === "Active") {
        return {
          id: auth.profile.id,
          name: auth.profile.name,
          email: auth.profile.email,
          password: "Supabase auth",
          status: auth.profile.status,
          createdAt: ""
        };
      }
      return state.ownerUsers.find((user) => user.id === ownerId && user.status === "Active");
    },
    [auth.enabled, auth.profile, ownerId, state.ownerUsers]
  );
  const visibleLeagues = useMemo(
    () => scopedLeagueId ? state.leagues.filter((league) => league.id === scopedLeagueId) : state.leagues,
    [scopedLeagueId, state.leagues]
  );

  useEffect(() => {
    setTeamByLeague((current) => {
      const next: Record<string, string> = {};
      visibleLeagues.forEach((league) => {
        const teams = state.teams.filter((team) => (team.leagueIds || []).includes(league.id));
        if (teams[0]) next[league.id] = current[league.id] || teams[0].id;
      });
      const unchanged = Object.keys(next).length === Object.keys(current).length
        && Object.entries(next).every(([leagueId, teamId]) => current[leagueId] === teamId);
      return unchanged ? current : next;
    });
  }, [visibleLeagues, state.teams]);

  async function signup() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage("Fill name, email, and password to create an owner account.");
      return;
    }
    if (auth.enabled) {
      const result = await auth.signUp({ name: name.trim(), email: email.trim().toLowerCase(), password, role: "owner" });
      setMessage(result.message || (result.ok ? "Owner account created. Login with your email and password." : "Could not create owner account."));
      if (result.ok) setMode("login");
      return;
    }
    const duplicate = state.ownerUsers.some((user) => user.email.toLowerCase() === email.trim().toLowerCase());
    if (duplicate) {
      setMessage("An owner account with this email already exists. Login instead.");
      return;
    }
    actions.addOwnerUser({ name, email, password });
    setMessage("Owner account created. Login with your email and password.");
    setMode("login");
  }

  async function login() {
    if (auth.enabled) {
      const result = await auth.signIn(email.trim().toLowerCase(), password);
      setMessage(result.ok ? "" : result.message);
      return;
    }
    const user = state.ownerUsers.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password);
    if (!user) {
      setMessage("Invalid owner email or password.");
      return;
    }
    if (user.status !== "Active") {
      setMessage("This owner account is disabled.");
      return;
    }
    window.localStorage.setItem(SESSION_KEY, user.id);
    setOwnerId(user.id);
    setMessage("");
  }

  async function requestReset() {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setMessage("Enter your registered owner email.");
      return;
    }
    if (auth.enabled) {
      const result = await auth.requestPasswordReset(cleanEmail);
      setMessage(result.message || (result.ok ? "Password reset link sent. Check your email inbox." : "Could not send reset email."));
      return;
    }
    const user = state.ownerUsers.find((item) => item.email.toLowerCase() === cleanEmail);
    if (!user) {
      setMessage("No owner account found with this email in this browser.");
      return;
    }
    if (resetPassword.trim().length < 6) {
      setMessage("Enter a new password with at least 6 characters.");
      return;
    }
    actions.updateOwnerPassword(cleanEmail, resetPassword);
    setMode("login");
    setPassword("");
    setResetPassword("");
    setMessage("Password reset. Login with your new password.");
  }

  async function logout() {
    if (auth.enabled) await auth.signOut();
    window.localStorage.removeItem(SESSION_KEY);
    setOwnerId("");
    setActiveEntry(null);
  }

  function setLeagueTeam(leagueId: string, teamId: string) {
    setTeamByLeague((current) => ({ ...current, [leagueId]: teamId }));
  }

  function requestAccess(leagueId: string) {
    if (!owner) return;
    const league = state.leagues.find((item) => item.id === leagueId);
    const teamId = teamByLeague[leagueId];
    if (!league) return;
    if (!teamId) {
      setMessage("Admin has not added teams for this league yet.");
      return;
    }
    if (league.managementMode === "admin") {
      setMessage("This league is admin-managed. Owners can watch, but cannot request bidding access.");
      return;
    }
    if (league.registrationStatus !== "Open") {
      setMessage(`${league.name} is not open for owner registration right now.`);
      return;
    }
    actions.selectLeague(leagueId);
    actions.requestOwnerAccess(teamId, owner.name, owner.id, owner.email, leagueId);
    setMessage(`Request sent to ${league.createdByAdminName} for ${league.name}. Owner login billing is Rs. 499 and admin approval is required before bidding.`);
  }

  function enterLeague(leagueId: string) {
    if (!owner) return;
    const teamId = teamByLeague[leagueId];
    const request = state.ownerRequests.find((item) => item.ownerUserId === owner.id && item.leagueId === leagueId && item.teamId === teamId);
    if (request?.status !== "Approved") {
      setMessage("Admin approval is required before entering this league.");
      return;
    }
    actions.selectLeague(leagueId);
    if (!scopedLeagueId) {
      router.push(withBasePath(`/live/owner?leagueId=${encodeURIComponent(request.leagueId)}`));
      return;
    }
    setActiveEntry({ leagueId, teamId: request.teamId });
  }

  if (activeEntry && owner) {
    const league = state.leagues.find((item) => item.id === activeEntry.leagueId);
    return (
      <>
        <div className="mb-5 flex flex-col justify-between gap-3 rounded-2xl border border-arena-gold/20 bg-arena-gold/10 p-4 sm:flex-row sm:items-center">
          <div>
            <div className="gold-kicker">Owner Bidding Session</div>
            <p className="mt-1 text-sm text-arena-muted">{owner.name} bidding in {league?.name || "selected league"}.</p>
          </div>
          <button onClick={() => setActiveEntry(null)} className="dark-button">Back to Leagues</button>
        </div>
        <AuctionRoom mode="owner" ownerTeamId={activeEntry.teamId} />
      </>
    );
  }

  if (!owner) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="glass-card p-4 sm:p-6">
          <div className="gold-kicker">{mode === "reset" ? "Owner Password Reset" : "Owner Account"}</div>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">{mode === "login" ? "Login as team owner" : mode === "signup" ? "Create owner account" : "Recover your owner login"}</h2>
          <p className="mt-3 text-sm text-arena-muted">
            {auth.enabled
              ? "Secure Supabase login is active. Owners still need admin approval for each league."
              : mode === "reset"
              ? "Enter your saved owner email. Live backend mode sends a secure email link; demo mode resets the browser account here."
              : "Owners need an account before requesting access to any league."}
          </p>
          <div className="mt-6 grid gap-4">
            {mode === "signup" && <input aria-label="Owner name" className="input-dark" placeholder="Owner name" value={name} onChange={(event) => setName(event.target.value)} />}
            <input aria-label="Owner email" className="input-dark" placeholder="Owner email" value={email} onChange={(event) => setEmail(event.target.value)} />
            {mode !== "reset" && <input aria-label="Owner password" className="input-dark" type="password" placeholder="Owner password" value={password} onChange={(event) => setPassword(event.target.value)} />}
            {mode === "reset" && !auth.enabled && (
              <input
                aria-label="New owner password"
                className="input-dark"
                type="password"
                placeholder="New password"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
              />
            )}
            <button onClick={mode === "login" ? login : mode === "signup" ? signup : requestReset} className="red-button">
              {mode === "login" ? "Login" : mode === "signup" ? "Create Account" : auth.enabled ? "Send Reset Email" : "Reset Password"}
            </button>
            {mode === "login" && (
              <button onClick={() => { setMode("reset"); setMessage(""); setPassword(""); }} className="text-center text-sm font-semibold text-arena-gold transition hover:text-white">
                Forgot password?
              </button>
            )}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }} className="dark-button">
              {mode === "login" ? "Create new owner account" : "Already have an account"}
            </button>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-arena-muted">
              Create an owner account, then request approval from the admin of a published owner-bidding league.
            </div>
            {message && <p className="text-sm text-red-100">{message}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-arena-gold/20 bg-arena-gold/10 p-4 sm:flex-row sm:items-center">
        <div>
          <div className="gold-kicker">Owner League Lobby</div>
          <p className="mt-1 text-sm text-arena-muted">
            {scopedLeagueId ? `Logged in as ${owner.name}. Request access or enter this league after approval.` : `Logged in as ${owner.name}. Select any available league and request admin approval to enter.`}
          </p>
        </div>
        <button onClick={logout} className="dark-button">Logout Owner</button>
      </div>

      {message && <div className="glass-card p-4 text-sm text-arena-muted">{message}</div>}

      <div className="grid gap-4 lg:grid-cols-2">
        {visibleLeagues.map((league) => {
          const teams = state.teams.filter((team) => (team.leagueIds || []).includes(league.id));
          const teamId = teamByLeague[league.id] || teams[0]?.id || "";
          const request = state.ownerRequests.find((item) => item.ownerUserId === owner.id && item.leagueId === league.id && (!teamId || item.teamId === teamId));
          const canRequest = league.managementMode === "owner" && league.registrationStatus === "Open";
          return (
            <div key={league.id} className="glass-card p-4 sm:p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <div className="gold-kicker">{league.sport}</div>
                  <h3 className="mt-2 single-line text-2xl font-semibold">{league.name}</h3>
                  <p className="mt-2 text-sm text-arena-muted">
                    Managed by {league.createdByAdminName} | {league.managementMode === "owner" ? "Owner bidding enabled" : "Admin managed"} | {league.registrationStatus || "Open"}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-arena-muted">{request?.status || "Not requested"}</span>
              </div>

              {teams.length > 0 ? (
                <label className="mt-5 block">
                  <span className="mb-2 block text-sm font-semibold text-arena-muted">Choose team for this league</span>
                  <select className="input-dark" value={teamId} onChange={(event) => setLeagueTeam(league.id, event.target.value)}>
                    {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                  </select>
                </label>
              ) : (
                <div className="mt-5 rounded-xl border border-arena-gold/30 bg-arena-gold/10 p-3 text-sm text-arena-muted">
                  Admin has not added teams for this league yet. You can request access after teams are published.
                </div>
              )}

              {!canRequest && (
                <div className="mt-4 rounded-xl border border-arena-gold/30 bg-arena-gold/10 p-3 text-sm text-arena-muted">
                  {league.managementMode === "admin" ? "This league is controlled completely by admin. You can watch it, but owner bidding is not open." : "Registration is not open right now. The admin can reopen it from tournament setup."}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => requestAccess(league.id)} disabled={!canRequest || !teamId} className={`dark-button flex-1 ${!canRequest || !teamId ? "cursor-not-allowed opacity-50" : ""}`}>
                  Request Admin Approval
                </button>
                <button onClick={() => enterLeague(league.id)} disabled={request?.status !== "Approved"} className={`red-button flex-1 ${request?.status !== "Approved" ? "cursor-not-allowed opacity-50" : ""}`}>
                  Enter League
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
