import { Suspense } from "react";
import { QueryLeagueView } from "@/components/QueryLeagueView";
import { AppShell } from "@/components/ui";

export default function LiveSpectatorPage() {
  return (
    <AppShell title="League Spectator View" subtitle="Public viewing for this specific auction league.">
      <Suspense fallback={<div className="glass-card p-6">Loading spectator link...</div>}>
        <QueryLeagueView view="spectator" />
      </Suspense>
    </AppShell>
  );
}
