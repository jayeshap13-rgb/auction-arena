"use client";

import { useState, type ChangeEvent } from "react";
import { useAuctionStore } from "@/lib/auctionStore";
import { prepareImageUpload } from "@/lib/imageUpload";
import { PlayerCard } from "./ui";

export function PlayerManager() {
  const { state, leaguePlayers, currentPlayer, actions } = useAuctionStore();
  const [name, setName] = useState("");
  const [role, setRole] = useState("All-rounder");
  const [category, setCategory] = useState("A");
  const [basePrice, setBasePrice] = useState(50);
  const [photo, setPhoto] = useState("");
  const [photoMessage, setPhotoMessage] = useState("");

  async function readPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoMessage("Preparing image...");
    try {
      setPhoto(await prepareImageUpload(file, 640));
      setPhotoMessage("Photo optimized and ready.");
    } catch (error) {
      setPhoto("");
      setPhotoMessage(error instanceof Error ? error.message : "Photo could not be uploaded.");
    }
  }

  function addPlayer() {
    if (!state.leagues.some((league) => league.id === state.currentLeagueId)) {
      setPhotoMessage("Create or select a league before adding players.");
      return;
    }
    if (!name.trim()) {
      setPhotoMessage("Enter a player name first.");
      return;
    }
    actions.addPlayer({
      name: name.trim(),
      role,
      category,
      basePrice: Number(basePrice) || 50,
      rating: "8.0",
      stats: "New entry / scouting report pending",
      photo
    });
    setName("");
    setBasePrice(50);
    setPhoto("");
    setPhotoMessage("Player added to this league.");
  }

  function addSampleBatch() {
    ["Rahil Sharma", "Kian D'Souza", "Amit Rawat"].forEach((player, index) => {
      actions.addPlayer({
        name: player,
        role: ["Opening Batter", "Fast Bowler", "Wicket Keeper"][index],
        category: ["B", "A", "Emerging"][index],
        basePrice: [40, 75, 30][index],
        rating: "7.8",
        stats: "Bulk upload sample player"
      });
    });
  }

  return (
    <>
      <div className="glass-card mb-5 p-5">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div className="min-w-0">
            <div className="gold-kicker">Player Entry</div>
            <p className="mt-2 text-sm text-arena-muted">Add a player manually or simulate a bulk upload batch.</p>
          </div>
          <button onClick={addSampleBatch} className="dark-button">Upload Sample Sheet</button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          <input aria-label="Player name" className="input-dark md:col-span-2" placeholder="Player name" value={name} onChange={(event) => setName(event.target.value)} />
          <input aria-label="Role" className="input-dark" value={role} onChange={(event) => setRole(event.target.value)} />
          <select aria-label="Category" className="input-dark" value={category} onChange={(event) => setCategory(event.target.value)}>
            {["Marquee", "A", "B", "Emerging"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input aria-label="Base price" className="input-dark" type="number" value={basePrice} onChange={(event) => setBasePrice(Number(event.target.value))} />
          <label className="rounded-xl border border-white/10 bg-white/5 p-4 md:col-span-5">
            <span className="block text-sm font-semibold text-arena-muted">Player photo</span>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input aria-label="Upload player photo" type="file" accept="image/*" onChange={readPhoto} className="block w-full text-sm text-arena-muted file:mr-4 file:rounded-full file:border-0 file:bg-arena-red file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
              {photo && <img src={photo} alt="Player preview" className="h-16 w-16 shrink-0 rounded-xl object-cover" />}
            </div>
            {photoMessage && <span className="mt-2 block text-xs text-arena-muted">{photoMessage}</span>}
          </label>
        </div>
        <button onClick={addPlayer} className="red-button mt-4">Add Player</button>
      </div>
      {leaguePlayers.length === 0 && (
        <div className="glass-card p-5 text-sm text-arena-muted">
          No players have been added to {state.league.name} yet. Add the first player above or use the sample sheet button.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {leaguePlayers.map((player) => (
          <div key={player.id} className="relative">
            <button
              onClick={() => actions.toggleWishlist(player.id)}
              className={`absolute right-3 top-3 z-10 rounded-full border px-3 py-1 text-xs font-semibold ${player.wishlist ? "border-arena-gold bg-arena-gold/20 text-arena-gold" : "border-white/10 bg-black/50 text-arena-muted"}`}
            >
              {player.wishlist ? "Wishlisted" : "Wishlist"}
            </button>
            {player.status !== "Sold" && (
              <button
                onClick={() => actions.selectPlayer(player.id)}
                className={`absolute bottom-3 right-3 z-10 rounded-full border px-3 py-1 text-xs font-semibold ${currentPlayer.id === player.id ? "border-arena-red bg-arena-red/25 text-white" : "border-white/10 bg-black/60 text-white"}`}
              >
                {currentPlayer.id === player.id ? "In Auction" : "Send to Auction"}
              </button>
            )}
            <PlayerCard player={player} />
          </div>
        ))}
      </div>
    </>
  );
}
