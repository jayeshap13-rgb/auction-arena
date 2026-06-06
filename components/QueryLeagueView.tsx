"use client";

import { useSearchParams } from "next/navigation";
import { LeagueScopedView } from "@/components/LeagueScopedView";

export function QueryLeagueView({ view }: { view: "spectator" | "owner" | "projector" }) {
  const searchParams = useSearchParams();
  const leagueId = searchParams.get("leagueId") || "";

  if (!leagueId) {
    return (
      <div className="glass-card p-6">
        <div className="gold-kicker">League Link Required</div>
        <h2 className="mt-3 text-2xl font-semibold">Open this mode from a live auction card</h2>
        <p className="mt-3 text-sm leading-6 text-arena-muted">
          Each live auction creates its own spectator, owner, and projector links.
        </p>
      </div>
    );
  }

  return <LeagueScopedView leagueId={leagueId} view={view} />;
}
