"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuctionStore } from "@/lib/auctionStore";

export const ADMIN_SESSION_KEY = "bidarena-admin-session-v1";
const ADMIN_LAST_ACTIVITY_KEY = "bidarena-admin-last-activity-v1";
const ADMIN_IDLE_TIMEOUT_MS = 5 * 60 * 1000;

export function AdminGate({ children }: { children: ReactNode }) {
  const { state, actions } = useAuctionStore();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    setSessionId(window.localStorage.getItem(ADMIN_SESSION_KEY) || "");
  }, []);

  const currentAdmin = useMemo(
    () => state.adminUsers.find((admin) => admin.id === sessionId && admin.status === "Active"),
    [sessionId, state.adminUsers]
  );

  function submit() {
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

  function createAdmin() {
    const cleanEmail = email.trim().toLowerCase();
    const duplicate = state.adminUsers.some((admin) => admin.email.toLowerCase() === cleanEmail);
    if (!name.trim() || !cleanEmail || !password.trim()) {
      setError("Enter name, email, and password to create your admin account.");
      return;
    }
    if (duplicate) {
      setError("An admin account already exists with this email.");
      return;
    }
    actions.addAdminUser({ name: name.trim(), email: cleanEmail, password, role: "admin" });
    setMode("login");
    setError("Admin account created. Login to create your leagues.");
    setName("");
  }

  function lock() {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
    window.localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
    setSessionId("");
    setPassword("");
  }

  useEffect(() => {
    if (!currentAdmin) return;

    let timeoutId: number | undefined;
    const activityEvents = ["click", "keydown", "mousemove", "scroll", "touchstart", "pointerdown"];

    function logoutForInactivity() {
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
  }, [currentAdmin]);

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
        <div className="gold-kicker">{mode === "login" ? "Admin Login" : "Create Admin Account"}</div>
        <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">{mode === "login" ? "Sign in to manage auctions" : "Start hosting your leagues"}</h2>
        <p className="mt-3 text-sm text-arena-muted">
          {mode === "login"
            ? "Admins only see and edit leagues they create."
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
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                if (mode === "login") submit();
                else createAdmin();
              }
            }}
          />
          {error && <p className={`text-sm ${error.includes("created") ? "text-arena-gold" : "text-red-200"}`}>{error}</p>}
          {mode === "login" ? (
            <button onClick={submit} className="red-button w-full">Login as Admin</button>
          ) : (
            <button onClick={createAdmin} className="red-button w-full">Create Admin Account</button>
          )}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              if (mode === "signup") setEmail("");
            }}
            className="dark-button w-full"
          >
            {mode === "login" ? "Create a new admin account" : "Back to admin login"}
          </button>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-arena-muted">
            Create an admin account, choose admin-managed or owner self-bidding, and the correct billing rule is applied at launch or approval.
          </div>
        </div>
      </div>
    </div>
  );
}
