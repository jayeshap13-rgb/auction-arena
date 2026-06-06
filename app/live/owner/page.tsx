import { Suspense } from "react";
import { QueryLeagueView } from "@/components/QueryLeagueView";
import { AppShell } from "@/components/ui";

export default function LiveOwnerPage() {
  return (
    <AppShell title="League Owner Login" subtitle="Owner access and bidding for this specific league only.">
      <Suspense fallback={<div className="glass-card p-6">Loading owner link...</div>}>
        <QueryLeagueView view="owner" />
      </Suspense>
    </AppShell>
  );
}
