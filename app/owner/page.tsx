import { OwnerGate } from "@/components/OwnerGate";
import { AppShell } from "@/components/ui";

export default function OwnerPage() {
  return (
    <AppShell title="Owner Login" subtitle="Create an owner account, request access, and bid after admin approval.">
      <OwnerGate />
    </AppShell>
  );
}
