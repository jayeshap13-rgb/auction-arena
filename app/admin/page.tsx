import { AdminGate } from "@/components/AdminGate";
import { AdminPanel } from "@/components/AdminPanel";
import { AppShell } from "@/components/ui";

export default function AdminPage() {
  return (
    <AppShell title="Admin Dashboard" subtitle="Control tournaments, bidding modes, player states, teams, sponsors, and reports from one command room.">
      <AdminGate>
        <AdminPanel />
      </AdminGate>
    </AppShell>
  );
}
