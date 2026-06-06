"use client";

import { useMemo, useState } from "react";
import { ADMIN_SESSION_KEY } from "@/components/AdminGate";
import { useAuctionStore, type AdminUser } from "@/lib/auctionStore";

export function AdminUsers() {
  const { state, actions } = useAuctionStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminUser["role"]>("admin");
  const [message, setMessage] = useState("");

  const currentAdmin = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    const id = window.localStorage.getItem(ADMIN_SESSION_KEY);
    return state.adminUsers.find((admin) => admin.id === id);
  }, [state.adminUsers]);
  const canManage = currentAdmin?.role === "super_admin";

  function addUser() {
    if (!canManage) {
      setMessage("Only a super admin can add admin users.");
      return;
    }
    const duplicate = state.adminUsers.some((admin) => admin.email.toLowerCase() === email.trim().toLowerCase());
    if (duplicate || !name.trim() || !email.trim() || !password.trim()) {
      setMessage("Admin user could not be added. Check duplicate email or missing fields.");
      return;
    }
    actions.addAdminUser({ name, email, password, role });
    setMessage("Admin user added.");
    setName("");
    setEmail("");
    setPassword("");
    setRole("admin");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <div className="glass-card p-5">
        <div className="gold-kicker">Admin Users</div>
        <h2 className="mt-2 text-2xl font-semibold">Create admin accounts</h2>
        <p className="mt-2 text-sm text-arena-muted">Super admins can add managers or read-only viewers for league operations.</p>
        <div className="mt-5 space-y-3">
          <input aria-label="Admin name" className="input-dark" placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} />
          <input aria-label="New admin email" className="input-dark" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <input aria-label="New admin password" className="input-dark" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <select aria-label="Admin role" className="input-dark" value={role} onChange={(event) => setRole(event.target.value as AdminUser["role"])}>
            <option value="admin">Admin Manager</option>
            <option value="viewer">Read-only Viewer</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <button onClick={addUser} disabled={!canManage} className={`red-button w-full ${!canManage ? "cursor-not-allowed opacity-50" : ""}`}>Add Admin User</button>
          {message && <p className="text-sm text-arena-muted">{message}</p>}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <div className="gold-kicker">Team Access</div>
          <h2 className="mt-2 text-2xl font-semibold">Registered admins</h2>
        </div>
        <div className="divide-y divide-white/10">
          {state.adminUsers.map((admin) => (
            <div key={admin.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="min-w-0">
                <div className="single-line font-semibold">{admin.name}</div>
                <div className="single-line text-sm text-arena-muted">{admin.email} | {admin.role.replace("_", " ")} | {admin.status}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  aria-label={`Role for ${admin.email}`}
                  className="input-dark min-w-[150px]"
                  value={admin.role}
                  disabled={!canManage || admin.id === currentAdmin?.id}
                  onChange={(event) => actions.updateAdminUserRole(admin.id, event.target.value as AdminUser["role"])}
                >
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <button
                  onClick={() => actions.setAdminUserStatus(admin.id, admin.status === "Active" ? "Disabled" : "Active")}
                  disabled={!canManage || admin.id === currentAdmin?.id}
                  className={`dark-button ${!canManage || admin.id === currentAdmin?.id ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {admin.status === "Active" ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
