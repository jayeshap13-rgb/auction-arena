"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type Player, type Team } from "@/lib/data";

export type Bid = { id: string; teamId: string; team: string; playerId: string; player: string; amount: number; time: string };
export type OwnerRequest = {
  id: string;
  ownerUserId?: string;
  leagueId: string;
  league: string;
  teamId: string;
  team: string;
  ownerEmail?: string;
  owner: string;
  status: "Pending" | "Approved" | "Rejected";
  paymentStatus?: "pending" | "paid";
  paymentReference?: string;
  paidAt?: string;
  requestedAt: string;
};
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "super_admin" | "admin" | "viewer";
  status: "Active" | "Disabled";
  createdAt: string;
};
export type OwnerUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  status: "Active" | "Disabled";
  createdAt: string;
};

type League = {
  id: string;
  name: string;
  sport: string;
  managementMode: "admin" | "owner";
  accessType?: "demo" | "paid";
  paymentStatus?: "free" | "payment_required" | "paid";
  paidAt?: string;
  paymentReference?: string;
  paidTeamSlots?: number;
  visibility?: "public" | "private";
  registrationStatus?: "Draft" | "Open" | "Closed";
  registrationMode?: "teams" | "players" | "invite";
  auctionFormat?: "open" | "sealed" | "hybrid";
  auctionOrder?: "sequence" | "random";
  bidIncrement?: number;
  maxTeams?: number;
  maxPlayersPerTeam?: number;
  ownerApprovalRequired?: boolean;
  createdByAdminId: string;
  createdByAdminName: string;
  purse: number;
  round: number;
  status: "Paused" | "Live";
  sponsor: string;
};

export type AuctionState = {
  league: League;
  leagues: League[];
  currentLeagueId: string;
  teams: Team[];
  players: Player[];
  bids: Bid[];
  currentPlayerId: string;
  timer: number;
  isRunning: boolean;
  soldFlash: "Sold" | "Unsold" | null;
  ownerRequests: OwnerRequest[];
  adminUsers: AdminUser[];
  ownerUsers: OwnerUser[];
};

const STORAGE_KEY = "auction-arena-trial-state-v3";
const LEGACY_STORAGE_KEYS = ["auction-arena-trial-state-v2", "auction-arena-trial-state-v1", "auction-arena-state-v7", "auction-arena-state-v6", "bidarena-state"];
const MAX_STORED_IMAGE_LENGTH = 360_000;
const FREE_TEAM_LIMIT = 3;

const EMPTY_LEAGUE: League = {
  id: "trial-workspace",
  name: "Create your first auction",
  sport: "Sports",
  managementMode: "admin",
  accessType: "paid",
  paymentStatus: "free",
  visibility: "public",
  registrationStatus: "Draft",
  registrationMode: "teams",
  auctionFormat: "open",
  auctionOrder: "sequence",
  bidIncrement: 10,
  maxTeams: FREE_TEAM_LIMIT,
  maxPlayersPerTeam: 8,
  ownerApprovalRequired: true,
  createdByAdminId: "",
  createdByAdminName: "",
  purse: 1000,
  round: 1,
  status: "Paused",
  sponsor: "TITLE SPONSOR"
};

const EMPTY_PLAYER: Player = {
  id: "no-player",
  name: "Add players to begin",
  role: "Player roster is empty",
  category: "Setup",
  basePrice: 0,
  rating: "-",
  status: "Queued",
  photo: "AA",
  stats: "Open Admin > Players to add the first auction lot."
};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function initialState(): AuctionState {
  return {
    league: EMPTY_LEAGUE,
    leagues: [],
    currentLeagueId: EMPTY_LEAGUE.id,
    teams: [],
    players: [],
    bids: [],
    currentPlayerId: "",
    timer: 24,
    isRunning: false,
    soldFlash: null,
    ownerRequests: [],
    adminUsers: [],
    ownerUsers: []
  };
}

function withNormalizedState(raw: Partial<AuctionState>): AuctionState {
  const base = initialState();
  const leagues = Array.isArray(raw.leagues) ? raw.leagues : base.leagues;
  const normalizedLeagues = leagues.map((league) => ({
    ...league,
    managementMode: league.managementMode || "owner" as const,
    accessType: league.accessType || "paid" as const,
    paymentStatus: league.paymentStatus || "free" as League["paymentStatus"],
    paidAt: league.paidAt,
    paymentReference: league.paymentReference,
    paidTeamSlots: Number(league.paidTeamSlots) || 0,
    visibility: league.visibility || "public" as const,
    registrationStatus: league.registrationStatus || "Draft" as const,
    registrationMode: league.registrationMode || "teams" as const,
    auctionFormat: league.auctionFormat || "open" as const,
    auctionOrder: league.auctionOrder || "sequence" as const,
    bidIncrement: Number(league.bidIncrement) || 10,
    maxTeams: Math.max(Number(league.maxTeams) || 8, league.paymentStatus === "paid" ? 0 : FREE_TEAM_LIMIT),
    maxPlayersPerTeam: Number(league.maxPlayersPerTeam) || 16,
    ownerApprovalRequired: league.ownerApprovalRequired ?? true,
    createdByAdminId: league.createdByAdminId || "",
    createdByAdminName: league.createdByAdminName || "Auction Admin"
  }));
  const currentLeagueId = raw.currentLeagueId || raw.league?.id || normalizedLeagues[0]?.id || EMPTY_LEAGUE.id;
  const league = normalizedLeagues.find((item) => item.id === currentLeagueId) || normalizedLeagues[0] || EMPTY_LEAGUE;
  const teams = (Array.isArray(raw.teams) ? raw.teams : base.teams).map((team) => ({
    ...team,
    registrationStatus: team.registrationStatus || "Approved" as const,
    leagueIds: team.leagueIds?.length ? team.leagueIds : normalizedLeagues[0] ? [normalizedLeagues[0].id] : []
  }));
  const players = (Array.isArray(raw.players) ? raw.players : base.players).map((player) => ({
    ...player,
    leagueId: player.leagueId || currentLeagueId,
    approvalStatus: player.approvalStatus || "Approved" as const,
    submittedBy: player.submittedBy || "Admin roster"
  }));
  const adminUsers = Array.isArray(raw.adminUsers) ? raw.adminUsers : base.adminUsers;
  const ownerUsers = Array.isArray(raw.ownerUsers) ? raw.ownerUsers : base.ownerUsers;
  const ownerRequests = (Array.isArray(raw.ownerRequests) ? raw.ownerRequests : base.ownerRequests).map((request) => ({
    ...request,
    paymentStatus: request.paymentStatus || "pending" as const
  }));
  return { ...base, ...raw, leagues: normalizedLeagues, currentLeagueId: league.id, league, teams, players, ownerRequests, adminUsers, ownerUsers };
}

function loadState() {
  if (typeof window === "undefined") return initialState();
  try {
    LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? stripOversizedImages(withNormalizedState(JSON.parse(saved))) : initialState();
  } catch {
    return initialState();
  }
}

function saveState(state: AuctionState) {
  if (typeof window !== "undefined") {
    const safeState = stripOversizedImages(state);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeState));
    } catch (error) {
      if (!(error instanceof DOMException) || error.name !== "QuotaExceededError") throw error;
      const withoutUploads: AuctionState = {
        ...safeState,
        teams: safeState.teams.map((team) => ({ ...team, logo: undefined })),
        players: safeState.players.map((player) => ({ ...player, photo: player.photo?.startsWith("data:") ? player.name.slice(0, 2).toUpperCase() : player.photo }))
      };
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutUploads));
        window.dispatchEvent(new CustomEvent("auction-storage-recovered"));
      } catch {
        // Keep the running session usable even when unrelated origin storage is full.
      }
    }
  }
}

function stripOversizedImages(state: AuctionState): AuctionState {
  return {
    ...state,
    teams: state.teams.map((team) => ({
      ...team,
      logo: team.logo?.startsWith("data:") && team.logo.length > MAX_STORED_IMAGE_LENGTH ? undefined : team.logo
    })),
    players: state.players.map((player) => ({
      ...player,
      photo: player.photo?.startsWith("data:") && player.photo.length > MAX_STORED_IMAGE_LENGTH ? player.name.slice(0, 2).toUpperCase() : player.photo
    }))
  };
}

export function useAuctionStore() {
  const [state, setState] = useState<AuctionState>(() => initialState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveState(state);
  }, [ready, state]);

  useEffect(() => {
    if (!state.isRunning || state.timer <= 0) return;
    const id = window.setInterval(() => {
      setState((current) => current.isRunning ? { ...current, timer: Math.max(0, current.timer - 1) } : current);
    }, 1000);
    return () => window.clearInterval(id);
  }, [state.isRunning, state.timer]);

  const leaguePlayers = useMemo(
    () => state.players.filter((player) => (player.leagueId || state.currentLeagueId) === state.currentLeagueId),
    [state.currentLeagueId, state.players]
  );

  const currentPlayer = useMemo(
    () => leaguePlayers.find((player) => player.id === state.currentPlayerId) || leaguePlayers[0] || EMPTY_PLAYER,
    [leaguePlayers, state.currentPlayerId]
  );

  const currentBids = useMemo(
    () => state.bids.filter((bid) => bid.playerId === currentPlayer.id),
    [currentPlayer.id, state.bids]
  );

  const highestBid = currentBids[0];
  const currentBid = highestBid?.amount || currentPlayer.basePrice;
  const leader = highestBid?.team || "Open";
  const leagueTeams = useMemo(
    () => state.teams.filter((team) => (team.leagueIds || []).includes(state.currentLeagueId)),
    [state.currentLeagueId, state.teams]
  );

  const update = useCallback((updater: (state: AuctionState) => AuctionState) => {
    setState((current) => updater(current));
  }, []);

  const actions = useMemo(() => ({
    updateLeague(next: Partial<League>) {
      update((current) => {
        const league = { ...current.league, ...next };
        return {
          ...current,
          league,
          leagues: current.leagues.map((item) => item.id === current.currentLeagueId ? league : item)
        };
      });
    },
    addLeague(league: Pick<League, "name" | "sport" | "purse" | "sponsor" | "managementMode" | "createdByAdminId" | "createdByAdminName"> & Partial<Pick<League, "accessType" | "visibility" | "registrationStatus" | "registrationMode" | "auctionFormat" | "bidIncrement" | "maxTeams" | "maxPlayersPerTeam" | "ownerApprovalRequired">>) {
      update((current) => {
        const nextLeague: League = {
          id: uid("league"),
          name: league.name,
          sport: league.sport,
          managementMode: league.managementMode,
          accessType: league.accessType || "paid",
          paymentStatus: "free",
          paidTeamSlots: 0,
          visibility: league.visibility || "public",
          registrationStatus: league.registrationStatus || "Open",
          registrationMode: league.registrationMode || "teams",
          auctionFormat: league.auctionFormat || "open",
          bidIncrement: Number(league.bidIncrement) || 10,
          maxTeams: Number(league.maxTeams) || 8,
          maxPlayersPerTeam: Number(league.maxPlayersPerTeam) || 16,
          ownerApprovalRequired: league.ownerApprovalRequired ?? true,
          createdByAdminId: league.createdByAdminId,
          createdByAdminName: league.createdByAdminName,
          purse: Number(league.purse) || 1000,
          sponsor: league.sponsor || "TITLE SPONSOR",
          round: 1,
          status: "Paused"
        };
        return { ...current, leagues: [...current.leagues, nextLeague], currentLeagueId: nextLeague.id, league: nextLeague };
      });
    },
    selectLeague(leagueId: string) {
      update((current) => {
        const league = current.leagues.find((item) => item.id === leagueId) || current.league;
        return { ...current, currentLeagueId: league.id, league };
      });
    },
    toggleTeamLeague(teamId: string, leagueId: string) {
      update((current) => ({
        ...current,
        teams: current.teams.map((team) => {
          if (team.id !== teamId) return team;
          const leagueIds = team.leagueIds || [];
          const nextIds = leagueIds.includes(leagueId) ? leagueIds.filter((id) => id !== leagueId) : [...leagueIds, leagueId];
          return { ...team, leagueIds: nextIds.length ? nextIds : [current.currentLeagueId] };
        })
      }));
    },
    updateTeam(teamId: string, next: Partial<Pick<Team, "name" | "owner" | "purse" | "spent" | "squad" | "color" | "logo" | "registrationStatus">>) {
      update((current) => ({
        ...current,
        teams: current.teams.map((team) => team.id === teamId ? { ...team, ...next } : team)
      }));
    },
    addTeam(team: Pick<Team, "name" | "owner" | "color"> & { logo?: string }) {
      update((current) => {
        const leagueTeamCount = current.teams.filter((item) => (item.leagueIds || []).includes(current.currentLeagueId)).length;
        const limit = Number(current.league.maxTeams) || 99;
        if (leagueTeamCount >= limit) return current;
        return {
          ...current,
          teams: [...current.teams, { id: uid("team"), name: team.name, owner: team.owner, color: team.color, logo: team.logo, purse: current.league.purse, spent: 0, squad: 0, leagueIds: [current.currentLeagueId], registrationStatus: "Approved" }]
        };
      });
    },
    markLeaguePaid(reference: string, paidSlots?: number) {
      update((current) => {
        const leagueTeamCount = current.teams.filter((item) => (item.leagueIds || []).includes(current.currentLeagueId)).length;
        const requiredSlots = Math.max(0, leagueTeamCount - FREE_TEAM_LIMIT);
        const league = {
          ...current.league,
          accessType: "paid" as const,
          paymentStatus: "paid" as const,
          paidAt: new Date().toLocaleString(),
          paymentReference: reference.trim() || "QR payment recorded",
          paidTeamSlots: Math.max(Number(current.league.paidTeamSlots) || 0, Number(paidSlots) || requiredSlots || 1),
          maxTeams: Math.max(Number(current.league.maxTeams) || 8, 8)
        };
        return {
          ...current,
          league,
          leagues: current.leagues.map((item) => item.id === current.currentLeagueId ? league : item)
        };
      });
    },
    addPlayer(player: Omit<Player, "id" | "status" | "photo"> & { photo?: string }) {
      update((current) => {
        if (!current.leagues.some((item) => item.id === current.currentLeagueId)) return current;
        const leaguePlayerCount = current.players.filter((item) => (item.leagueId || current.currentLeagueId) === current.currentLeagueId).length;
        const nextPlayer = { ...player, id: uid("player"), leagueId: current.currentLeagueId, status: leaguePlayerCount ? "Queued" as const : "Under Auction" as const, approvalStatus: "Approved" as const, submittedBy: "Admin roster", photo: player.photo || player.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() };
        return { ...current, players: [...current.players, nextPlayer], currentPlayerId: leaguePlayerCount ? current.currentPlayerId : nextPlayer.id };
      });
    },
    updatePlayer(playerId: string, next: Partial<Pick<Player, "name" | "role" | "category" | "basePrice" | "rating" | "stats" | "photo" | "status" | "approvalStatus">>) {
      update((current) => ({
        ...current,
        currentPlayerId: next.status === "Under Auction" ? playerId : current.currentPlayerId,
        players: current.players.map((player) => {
          if (player.id === playerId) return { ...player, ...next };
          if (next.status === "Under Auction" && (player.leagueId || current.currentLeagueId) === current.currentLeagueId && player.status === "Under Auction") {
            return { ...player, status: "Queued" as const };
          }
          return player;
        })
      }));
    },
    setPlayerApproval(playerId: string, approvalStatus: NonNullable<Player["approvalStatus"]>) {
      update((current) => ({
        ...current,
        players: current.players.map((player) => player.id === playerId ? { ...player, approvalStatus } : player)
      }));
    },
    addAdminUser(user: Omit<AdminUser, "id" | "createdAt" | "status">) {
      update((current) => {
        const exists = current.adminUsers.some((admin) => admin.email.toLowerCase() === user.email.trim().toLowerCase());
        if (exists || !user.name.trim() || !user.email.trim() || !user.password.trim()) return current;
        return {
          ...current,
          adminUsers: [{
            id: uid("admin"),
            name: user.name.trim(),
            email: user.email.trim().toLowerCase(),
            password: user.password,
            role: user.role,
            status: "Active",
            createdAt: new Date().toLocaleDateString()
          }, ...current.adminUsers]
        };
      });
    },
    syncAdminUser(user: AdminUser) {
      update((current) => {
        const exists = current.adminUsers.some((admin) => admin.id === user.id || admin.email.toLowerCase() === user.email.toLowerCase());
        return {
          ...current,
          adminUsers: exists
            ? current.adminUsers.map((admin) => admin.id === user.id || admin.email.toLowerCase() === user.email.toLowerCase() ? { ...admin, ...user } : admin)
            : [user, ...current.adminUsers]
        };
      });
    },
    addOwnerUser(user: Omit<OwnerUser, "id" | "createdAt" | "status">) {
      update((current) => {
        const exists = current.ownerUsers.some((owner) => owner.email.toLowerCase() === user.email.trim().toLowerCase());
        if (exists || !user.name.trim() || !user.email.trim() || !user.password.trim()) return current;
        return {
          ...current,
          ownerUsers: [{
            id: uid("owner"),
            name: user.name.trim(),
            email: user.email.trim().toLowerCase(),
            password: user.password,
            status: "Active",
            createdAt: new Date().toLocaleDateString()
          }, ...current.ownerUsers]
        };
      });
    },
    syncOwnerUser(user: OwnerUser) {
      update((current) => {
        const exists = current.ownerUsers.some((owner) => owner.id === user.id || owner.email.toLowerCase() === user.email.toLowerCase());
        return {
          ...current,
          ownerUsers: exists
            ? current.ownerUsers.map((owner) => owner.id === user.id || owner.email.toLowerCase() === user.email.toLowerCase() ? { ...owner, ...user } : owner)
            : [user, ...current.ownerUsers]
        };
      });
    },
    setAdminUserStatus(adminId: string, status: AdminUser["status"]) {
      update((current) => ({
        ...current,
        adminUsers: current.adminUsers.map((admin) => admin.id === adminId ? { ...admin, status } : admin)
      }));
    },
    updateAdminUserRole(adminId: string, role: AdminUser["role"]) {
      update((current) => ({
        ...current,
        adminUsers: current.adminUsers.map((admin) => admin.id === adminId ? { ...admin, role } : admin)
      }));
    },
    updateAdminPassword(email: string, password: string) {
      update((current) => ({
        ...current,
        adminUsers: current.adminUsers.map((admin) => admin.email.toLowerCase() === email.trim().toLowerCase() ? { ...admin, password } : admin)
      }));
    },
    updateOwnerPassword(email: string, password: string) {
      update((current) => ({
        ...current,
        ownerUsers: current.ownerUsers.map((owner) => owner.email.toLowerCase() === email.trim().toLowerCase() ? { ...owner, password } : owner)
      }));
    },
    requestOwnerAccess(teamId: string, owner: string, ownerUserId?: string, ownerEmail?: string, leagueId?: string) {
      update((current) => {
        const targetLeagueId = leagueId || current.currentLeagueId;
        const targetLeague = current.leagues.find((item) => item.id === targetLeagueId) || current.league;
        const team = current.teams.find((item) => item.id === teamId);
        if (!team || !owner.trim()) return current;
        if (targetLeague.managementMode === "admin") return current;
        if (targetLeague.registrationStatus !== "Open") return current;
        const existing = current.ownerRequests.find((request) => request.leagueId === targetLeagueId && request.teamId === teamId && (request.ownerUserId === ownerUserId || request.owner.toLowerCase() === owner.trim().toLowerCase()));
        if (existing) return current;
        return {
          ...current,
          ownerRequests: [{
            id: uid("owner"),
            ownerUserId,
            leagueId: targetLeagueId,
            league: targetLeague.name,
            teamId,
            team: team.name,
            ownerEmail,
            owner: owner.trim(),
            status: "Pending",
            paymentStatus: "pending",
            requestedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }, ...current.ownerRequests]
        };
      });
    },
    markOwnerRequestPaid(requestId: string, reference: string) {
      update((current) => ({
        ...current,
        ownerRequests: current.ownerRequests.map((item) => item.id === requestId ? {
          ...item,
          paymentStatus: "paid" as const,
          paymentReference: reference.trim() || "Owner login payment recorded",
          paidAt: new Date().toLocaleString()
        } : item)
      }));
    },
    setOwnerRequestStatus(requestId: string, status: OwnerRequest["status"]) {
      update((current) => ({
        ...current,
        ownerRequests: current.ownerRequests.map((item) => item.id === requestId ? { ...item, status } : item)
      }));
    },
    toggleWishlist(playerId: string) {
      update((current) => ({ ...current, players: current.players.map((player) => player.id === playerId ? { ...player, wishlist: !player.wishlist } : player) }));
    },
    start(order?: "sequence" | "random") {
      update((current) => {
        const leaguePlayers = current.players.filter((player) => (player.leagueId || current.currentLeagueId) === current.currentLeagueId);
        const hasPlayers = leaguePlayers.length > 0;
        if (!current.leagues.some((item) => item.id === current.currentLeagueId) || !hasPlayers || !current.teams.length) return current;
        const leagueTeamCount = current.teams.filter((item) => (item.leagueIds || []).includes(current.currentLeagueId)).length;
        const auctionOrder = order || current.league.auctionOrder || "sequence";
        const availablePlayers = leaguePlayers.filter((player) => player.status === "Queued" || player.status === "Under Auction");
        const currentLot = availablePlayers.find((player) => player.status === "Under Auction")
          || (auctionOrder === "random" ? availablePlayers[Math.floor(Math.random() * availablePlayers.length)] : availablePlayers[0])
          || leaguePlayers[0];
        const league = { ...current.league, status: "Live" as const, registrationStatus: "Closed" as const, auctionOrder };
        return {
          ...current,
          currentPlayerId: currentLot.id,
          timer: 24,
          isRunning: true,
          league,
          leagues: current.leagues.map((item) => item.id === league.id ? league : item),
          players: current.players.map((player) => (
            player.id === currentLot.id
              ? { ...player, status: "Under Auction" as const }
              : player.status === "Under Auction"
                ? { ...player, status: "Queued" as const }
                : player
          ))
        };
      });
    },
    pause() {
      update((current) => {
        const league = { ...current.league, status: "Paused" as const };
        return { ...current, isRunning: false, league, leagues: current.leagues.map((item) => item.id === league.id ? league : item) };
      });
    },
    resetTimer(seconds = 24) {
      update((current) => ({ ...current, timer: seconds }));
    },
    selectPlayer(playerId: string) {
      update((current) => ({
        ...current,
        currentPlayerId: playerId,
        timer: 24,
        soldFlash: null,
        players: current.players.map((player) => ({
          ...player,
          status: player.id === playerId && player.status !== "Sold" && player.status !== "Unsold" ? "Under Auction" : player.status === "Under Auction" ? "Queued" : player.status
        }))
      }));
    },
    placeBid(teamId: string, rawAmount?: number) {
      update((current) => {
        const player = current.players.find((item) => item.id === current.currentPlayerId) || current.players[0];
        const team = current.teams.find((item) => item.id === teamId);
        if (!player || !team || player.status === "Sold" || player.status === "Unsold") return current;
        const currentBid = current.bids.find((bid) => bid.playerId === player.id)?.amount || player.basePrice;
        const increment = Number(current.league.bidIncrement) || 10;
        const amount = Math.max(Number(rawAmount) || 0, currentBid + increment);
        const remaining = team.purse - team.spent;
        if (amount > remaining) return current;
        const bid: Bid = {
          id: uid("bid"),
          teamId: team.id,
          team: team.name,
          playerId: player.id,
          player: player.name,
          amount,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        const league = { ...current.league, status: "Live" as const };
        return { ...current, bids: [bid, ...current.bids], timer: 24, isRunning: true, league, leagues: current.leagues.map((item) => item.id === league.id ? league : item), soldFlash: null };
      });
    },
    undoBid() {
      update((current) => ({ ...current, bids: current.bids.slice(1), timer: 24 }));
    },
    mark(status: "Sold" | "Unsold") {
      update((current) => {
        const player = current.players.find((item) => item.id === current.currentPlayerId) || current.players[0];
        if (!player || player.status === status) return current;
        const bid = current.bids.find((item) => item.playerId === player.id);
        const teams = status === "Sold" && bid
          ? current.teams.map((team) => team.id === bid.teamId ? { ...team, spent: team.spent + bid.amount, squad: team.squad + 1 } : team)
          : current.teams;
        const league = { ...current.league, status: "Paused" as const };
        return {
          ...current,
          teams,
          isRunning: false,
          soldFlash: status,
          league,
          leagues: current.leagues.map((item) => item.id === league.id ? league : item),
          players: current.players.map((item) => item.id === player.id ? { ...item, status, soldTo: status === "Sold" ? bid?.team : undefined, soldPrice: status === "Sold" ? bid?.amount : undefined } : item)
        };
      });
    },
    nextLot(includeUnsold = false) {
      update((current) => {
        const leaguePlayers = current.players.filter((player) => (player.leagueId || current.currentLeagueId) === current.currentLeagueId);
        if (!leaguePlayers.length) return current;
        const currentIndex = leaguePlayers.findIndex((player) => player.id === current.currentPlayerId);
        const order = current.league.auctionOrder || "sequence";
        const eligible = leaguePlayers.filter((player) => player.status === "Queued" || (includeUnsold && player.status === "Unsold"));
        if (order === "random" && eligible.length) {
          const next = eligible[Math.floor(Math.random() * eligible.length)];
          return {
            ...current,
            currentPlayerId: next.id,
            timer: 24,
            soldFlash: null,
            players: current.players.map((player) => player.id === next.id ? { ...player, status: "Under Auction" } : player.status === "Under Auction" ? { ...player, status: "Queued" } : player)
          };
        }
        const ordered = [...leaguePlayers.slice(currentIndex + 1), ...leaguePlayers.slice(0, currentIndex + 1)];
        const next = ordered.find((player) => player.status === "Queued" || (includeUnsold && player.status === "Unsold")) || leaguePlayers[0];
        if (!next) return current;
        return {
          ...current,
          currentPlayerId: next.id,
          timer: 24,
          soldFlash: null,
          players: current.players.map((player) => player.id === next.id ? { ...player, status: "Under Auction" } : player.status === "Under Auction" ? { ...player, status: "Queued" } : player)
        };
      });
    },
    resetDemo() {
      setState(initialState());
    }
  }), [update]);

  return { ready, state, leagueTeams, leaguePlayers, currentPlayer, currentBid, currentBids, highestBid, leader, actions };
}
