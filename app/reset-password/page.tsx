"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/ui";
import { useSupabaseAuth } from "@/lib/useSupabaseAuth";

export default function ResetPasswordPage() {
  const auth = useSupabaseAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  async function updatePassword() {
    if (password !== confirmPassword) {
      setMessage("Both passwords must match.");
      return;
    }
    const result = await auth.updatePassword(password);
    setMessage(result.message || (result.ok ? "Password updated." : "Could not update password."));
  }

  return (
    <AppShell title="Reset Password" subtitle="Create a new password after opening the secure recovery link from your email.">
      <div className="mx-auto max-w-xl">
        <div className="glass-card p-4 sm:p-6">
          <div className="gold-kicker">Account Recovery</div>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Set your new password</h2>
          <p className="mt-3 text-sm text-arena-muted">
            Use this page after clicking the reset link sent to your email. After updating, return to login and continue as admin or owner.
          </p>

          <div className="mt-6 grid gap-3">
            <input
              aria-label="New password"
              className="input-dark"
              type="password"
              placeholder="New password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <input
              aria-label="Confirm new password"
              className="input-dark"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void updatePassword();
              }}
            />
            <button onClick={updatePassword} className="red-button w-full" disabled={!auth.enabled}>
              Update Password
            </button>
            <Link href="/login" className="dark-button w-full">
              Back to Login
            </Link>
            {!auth.enabled && (
              <div className="rounded-xl border border-arena-gold/30 bg-arena-gold/10 p-3 text-sm text-arena-muted">
                Email recovery becomes active after connecting the live auth backend. For the current browser demo, use Forgot password on the admin or owner login card.
              </div>
            )}
            {message && <p className="text-sm text-arena-gold">{message}</p>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
