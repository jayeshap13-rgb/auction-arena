import { Suspense } from "react";
import { QueryLeagueView } from "@/components/QueryLeagueView";

export default function LiveProjectorPage() {
  return (
    <main className="arena-shell h-screen overflow-hidden">
      <Suspense fallback={<div className="grid h-screen place-items-center text-white">Loading projector link...</div>}>
        <QueryLeagueView view="projector" />
      </Suspense>
    </main>
  );
}
