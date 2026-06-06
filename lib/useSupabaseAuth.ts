"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { UserRole } from "@/lib/supabaseTypes";
import { createBrowserSupabaseClient, hasSupabaseConfig } from "@/lib/supabase";
import { absoluteAppUrl } from "@/lib/routes";

type Profile = {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  status: "Active" | "Disabled";
};

type AuthResult = { ok: true; message?: string } | { ok: false; message: string };
type ProfileUpsertTable = {
  upsert: (values: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
};

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return fallback;
}

export function useSupabaseAuth(requiredRole?: UserRole) {
  const enabled = hasSupabaseConfig();
  const client = useMemo(() => createBrowserSupabaseClient(), []);
  const [loading, setLoading] = useState(enabled);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async () => {
    if (!client) {
      setLoading(false);
      return null;
    }

    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      setProfile(null);
      setLoading(false);
      return null;
    }

    const { data, error } = await client
      .from("profiles")
      .select("id, role, name, email, status")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) {
      setProfile(null);
      setLoading(false);
      return null;
    }

    const nextProfile = data as Profile;
    setProfile(nextProfile);
    setLoading(false);
    return nextProfile;
  }, [client]);

  useEffect(() => {
    void loadProfile();
    if (!client) return;

    const { data } = client.auth.onAuthStateChange(() => {
      void loadProfile();
    });

    return () => data.subscription.unsubscribe();
  }, [client, loadProfile]);

  async function signIn(email: string, password: string): Promise<AuthResult> {
    if (!client) return { ok: false, message: "Supabase is not configured." };
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, message: error.message };
    const nextProfile = await loadProfile();
    if (!nextProfile) return { ok: false, message: "Login succeeded, but profile was not found. Check the Supabase profile trigger." };
    if (requiredRole && nextProfile.role !== requiredRole) return { ok: false, message: `This account is registered as ${nextProfile.role}, not ${requiredRole}.` };
    if (nextProfile.status !== "Active") return { ok: false, message: "This account is disabled." };
    return { ok: true };
  }

  async function signUp(params: { name: string; email: string; password: string; role: UserRole }): Promise<AuthResult> {
    if (!client) return { ok: false, message: "Supabase is not configured." };
    const { name, email, password, role } = params;
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });
    if (error) return { ok: false, message: error.message };

    if (data.user && data.session) {
      const profilesTable = client.from("profiles") as unknown as ProfileUpsertTable;
      const { error: profileError } = await profilesTable.upsert({
        id: data.user.id,
        name,
        email,
        role,
        status: "Active"
      });
      if (profileError) return { ok: false, message: errorMessage(profileError, "Account created, but profile could not be saved.") };
      await loadProfile();
    }

    return {
      ok: true,
      message: data.session ? "Account created and logged in." : "Account created. Check email confirmation if Supabase requires it, then login."
    };
  }

  async function signOut() {
    if (!client) return;
    await client.auth.signOut();
    setProfile(null);
  }

  async function requestPasswordReset(email: string): Promise<AuthResult> {
    if (!client) return { ok: false, message: "Supabase is not configured." };
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return { ok: false, message: "Enter your registered email address." };
    const { error } = await client.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: absoluteAppUrl("/reset-password")
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Password reset link sent. Check your email inbox." };
  }

  async function updatePassword(password: string): Promise<AuthResult> {
    if (!client) return { ok: false, message: "Supabase is not configured." };
    if (password.trim().length < 6) return { ok: false, message: "Use at least 6 characters for the new password." };
    const { error } = await client.auth.updateUser({ password });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Password updated. You can login with the new password." };
  }

  return {
    enabled,
    loading,
    profile,
    isSignedIn: Boolean(profile && (!requiredRole || profile.role === requiredRole) && profile.status === "Active"),
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
    updatePassword,
    refresh: loadProfile
  };
}
