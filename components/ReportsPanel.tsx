"use client";

import { useAuctionStore } from "@/lib/auctionStore";

export function ReportsPanel() {
  const { state, leagueTeams, leaguePlayers } = useAuctionStore();
  const sold = leaguePlayers.filter((player) => player.status === "Sold");
  const unsold = leaguePlayers.filter((player) => player.status === "Unsold");

  function downloadReport() {
    const rows = [
      ["Team", "Owner", "Spent", "Remaining", "Squad"],
      ...leagueTeams.map((team) => [team.name, team.owner, `${team.spent}L`, `${team.purse - team.spent}L`, String(team.squad)])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "auction-arena-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-3">
        {[
          ["Sold Players", sold.length],
          ["Unsold Players", unsold.length],
          ["Total Bids", state.bids.length]
        ].map(([label, value]) => (
          <div key={label as string} className="red-card p-6">
            <div className="gold-kicker">{label}</div>
            <div className="mt-3 text-4xl font-semibold">{value}</div>
          </div>
        ))}
      </div>
      <div className="glass-card mt-5 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center">
          <div>
            <div className="gold-kicker">Team Summary</div>
            <h2 className="mt-1 text-2xl font-semibold">Final Purse Report</h2>
          </div>
          <button onClick={downloadReport} className="red-button">Download Report</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/5 text-arena-muted">
              <tr>
                <th className="p-4">Team</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Spent</th>
                <th className="p-4">Remaining</th>
                <th className="p-4">Squad</th>
              </tr>
            </thead>
            <tbody>
              {leagueTeams.map((team) => (
                <tr key={team.id} className="border-t border-white/10">
                  <td className="p-4 font-semibold">{team.name}</td>
                  <td className="p-4 text-arena-muted">{team.owner}</td>
                  <td className="p-4">Rs. {team.spent}L</td>
                  <td className="p-4 text-arena-gold">Rs. {team.purse - team.spent}L</td>
                  <td className="p-4">{team.squad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
