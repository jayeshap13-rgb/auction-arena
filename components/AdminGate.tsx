"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuctionStore } from "@/lib/auctionStore";
import { useSupabaseAuth } from "@/lib/useSupabaseAuth";

export const ADMIN_SESSION_KEY = "bidarena-admin-session-v1";
const ADMIN_LAST_ACTIVITY_KEY = "bidarena-admin-last-activity-v1";
const ADMIN_IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const TRIAL_STORAGE_KEYS = ["auction-arena-trial-state-v3", "auction-arena-trial-state-v2", "auction-arena-trial-state-v1", "auction-arena-state-v7", "auction-arena-state-v6", "bidarena-state"];

export function AdminGate({ children }: { children: ReactNode }) {
  const { state, actions } = useAuctionStore();
  const auth = useSupabaseAuth("admin");
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    setSessionId(window.localStorage.getItem(ADMIN_SESSION_KEY) || "");
  }, []);

  useEffect(() => {
    if (!auth.enabled || !auth.profile) return;
    const adminUser = {
      id: auth.profile.id,
      name: auth.profile.name,
      email: auth.profile.email,
      password: "Supabase auth",
      role: "admin" as const,
      status: auth.profile.status,
      createdAt: new Date().toLocaleDateString()
    };
    actions.syncAdminUser(adminUser);
    window.localStorage.setItem(ADMIN_SESSION_KEY, auth.profile.id);
    window.localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, String(Date.now()));
    setSessionId(auth.profile.id);
  }, [actions, auth.enabled, auth.profile]);

  const currentAdmin = useMemo(
    () => {
      if (auth.enabled && auth.profile?.role === "admin" && auth.profile.status === "Active") {
        return {
          id: auth.profile.id,
          name: auth.profile.name,
          email: auth.profile.email,
          password: "Supabase auth",
          role: "admin" as const,
          status: auth.profile.status,
          createdAt: ""
        };
      }
      return state.adminUsers.find((admin) => admin.id === sessionId && admin.status === "Active");
    },
    [auth.enabled, auth.profile, sessionId, state.adminUsers]
  );

  async function submit() {
    if (auth.enabled) {
      const result = await auth.signIn(email.trim().toLowerCase(), password);
      setError(result.ok ? "" : result.message);
      return;
    }
    const admin = state.adminUsers.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password);
    if (!admin) {
      setError("Invalid admin email or password.");
      return;
    }
    if (admin.status !== "Active") {
      setError("This admin account is disabled.");
      return;
    }
    window.localStorage.setItem(ADMIN_SESSION_KEY, admin.id);
    window.localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, String(Date.now()));
    setSessionId(admin.id);
    setError("");
  }

  async function createAdmin() {
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim() || !cleanEmail || !password.trim()) {
      setError("Enter name, email, and password to create your admin account.");
      return;
    }
    if (auth.enabled) {
      const result = await auth.signUp({ name: name.trim(), email: cleanEmail, password, role: "admin" });
      setError(result.message || (result.ok ? "Admin account created. Login to create your leagues." : "Could not create admin account."));
      if (result.ok) {
        setMode("login");
        setName("");
      }
      return;
    }
    const duplicate = state.adminUsers.some((admin) => admin.email.toLowerCase() === cleanEmail);
    if (duplicate) {
      setError("An admin account already exists with this email.");
      return;
    }
    actions.addAdminUser({ name: name.trim(), email: cleanEmail, password, role: "admin" });
    setMode("login");
    setError("Admin account created. Login to create your leagues.");
    setName("");
  }

  async function requestReset() {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Enter your registered admin email.");
      return;
    }
    if (auth.enabled) {
      const result = await auth.requestPasswordReset(cleanEmail);
      setError(result.message || (result.ok ? "Password reset link sent. Check your email inbox." : "Could not send reset email."));
      return;
    }
    const admin = state.adminUsers.find((item) => item.email.toLowerCase() === cleanEmail);
    if (!admin) {
      setError("No admin account found with this email in this browser.");
      return;
    }
    if (resetPassword.trim().length < 6) {
      setError("Enter a new password with at least 6 characters.");
      return;
    }
    actions.updateAdminPassword(cleanEmail, resetPassword);
    setMode("login");
    setPassword("");
    setResetPassword("");
    setError("Password reset. Login with your new password.");
  }

  async function lock() {
    if (auth.enabled) await auth.signOut();
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
    window.localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
    setSessionId("");
    setPassword("");
  }

  function resetBrowserTrial() {
    TRIAL_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
    window.localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
    window.localStorage.removeItem("bidarena-owner-account-session-v1");
    window.location.reload();
  }

  useEffect(() => {
    if (!currentAdmin) return;

    let timeoutId: number | undefined;
    const activityEvents = ["click", "keydown", "mousemove", "scroll", "touchstart", "pointerdown"];

    function logoutForInactivity() {
      if (auth.enabled) void auth.signOut();
      window.localStorage.removeItem(ADMIN_SESSION_KEY);
      window.localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
      setSessionId("");
      setPassword("");
      setError("Admin session timed out after 5 minutes of inactivity.");
    }

    function scheduleLogout() {
      window.clearTimeout(timeoutId);
      const lastActivity = Number(window.localStorage.getItem(ADMIN_LAST_ACTIVITY_KEY)) || Date.now();
      const remaining = ADMIN_IDLE_TIMEOUT_MS - (Date.now() - lastActivity);
      if (remaining <= 0) {
        logoutForInactivity();
        return;
      }
      timeoutId = window.setTimeout(logoutForInactivity, remaining);
    }

    function recordActivity() {
      window.localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, String(Date.now()));
      scheduleLogout();
    }

    if (!window.localStorage.getItem(ADMIN_LAST_ACTIVITY_KEY)) {
      window.localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, String(Date.now()));
    }

    scheduleLogout();
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, recordActivity, { passive: true });
    });

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, recordActivity);
      });
    };
  }, [auth, currentAdmin]);

  if (currentAdmin) {
    return (
      <>
        <div className="mb-5 flex flex-col justify-between gap-3 rounded-2xl border border-arena-gold/20 bg-arena-gold/10 p-4 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="gold-kicker">Admin Session</div>
            <p className="mt-1 text-sm text-arena-muted">
              Logged in as {currentAdmin.name} | {currentAdmin.role.replace("_", " ")} | auto logout after 5 min idle
            </p>
          </div>
          <button onClick={lock} className="dark-button shrink-0">Logout Admin</button>
        </div>
        {children}
      </>
    );
  }

  return (
    <div className="mx-auto grid min-h-[52vh] max-w-xl place-items-center">
      <div className="glass-card w-full p-4 sm:p-6">
        <div className="gold-kicker">{mode === "login" ? "Admin Login" : mode === "signup" ? "Create Admin Account" : "Reset Admin Password"}</div>
        <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">{mode === "login" ? "Sign in to manage auctions" : mode === "signup" ? "Start hosting your leagues" : "Recover your admin access"}</h2>
        <p className="mt-3 text-sm text-arena-muted">
          {auth.enabled
            ? "Secure Supabase login is active. Your admin profile is stored centrally."
            : mode === "login"
            ? "Admins only see and edit leagues they create."
            : mode === "reset"
            ? "Enter your saved admin email. Live backend mode sends a secure email link; demo mode resets the browser account here."
            : "Any organizer can create an admin account and manage their own auction leagues."}
        </p>
        <div className="mt-6 space-y-3">
          {mode === "signup" && (
            <input
              aria-label="Admin name"
              className="input-dark"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          )}
          <input
            aria-label="Admin email"
            className="input-dark"
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            aria-label="Admin password"
            className="input-dark"
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            hidden={mode === "reset"}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                if (mode === "login") submit();
                else createAdmin();
              }
            }}
          />
          {mode === "reset" && !auth.enabled && (
            <input
              aria-label="New admin password"
              className="input-dark"
              type="password"
              placeholder="New password"
              value={resetPassword}
              onChange={(event) => setResetPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void requestReset();
              }}
            />
          )}
          {error && <p className={`text-sm ${error.includes("created") ? "text-arena-gold" : "text-red-200"}`}>{error}</p>}
          {mode === "login" ? (
            <button onClick={submit} className="red-button w-full">Login as Admin</button>
          ) : mode === "signup" ? (
            <button onClick={createAdmin} className="red-button w-full">Create Admin Account</button>
          ) : (
            <button onClick={requestReset} className="red-button w-full">{auth.enabled ? "Send Reset Email" : "Reset Password"}</button>
          )}
          {mode === "login" && (
            <button onClick={() => { setMode("reset"); setError(""); setPassword(""); }} className="w-full text-center text-sm font-semibold text-arena-gold transition hover:text-white">
              Forgot password?
            </button>
          )}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setResetPassword("");
              if (mode === "signup") setEmail("");
            }}
            className="dark-button w-full"
          >
            {mode === "login" ? "Create a new admin account" : "Back to admin login"}
          </button>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-arena-muted">
            This browser stores the trial locally. For real multi-user auctions, connect the production backend.
          </div>
          <button onClick={resetBrowserTrial} className="w-full rounded-xl border border-arena-gold/25 bg-arena-gold/10 px-4 py-3 text-sm font-semibold text-arena-gold transition hover:bg-arena-gold/20">
            Reset This Browser Trial
          </button>
        </div>
      </div>
    </div>
  );
}
