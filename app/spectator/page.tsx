import { SpectatorHub } from "@/components/SpectatorHub";
import { AppShell } from "@/components/ui";

export default function SpectatorPage() {
  return (
    <AppShell title="Spectator View" subtitle="Browse upcoming and live leagues, then open any live auction for full public detail.">
      <SpectatorHub />
    </AppShell>
  );
}

