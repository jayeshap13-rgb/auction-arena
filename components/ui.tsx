import Link from "next/link";
import type { ReactNode } from "react";
import { players, teams, type Player, type Team } from "@/lib/data";
import { BrandLogo } from "./BrandLogo";
import { ThemeToggle } from "./ThemeToggle";

export const navItems = [
  ["Home", "/"],
  ["Features", "/features"],
  ["Pricing", "/pricing"],
  ["Auctions", "/spectator"]
];

export function Brand() {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center sm:h-11 sm:w-11">
        <BrandLogo className="h-full w-full" priority />
      </div>
      <div className="w-[156px] min-w-0 shrink-0 sm:w-[184px]">
        <div className="whitespace-nowrap text-base font-black uppercase leading-none tracking-wide sm:text-xl">Auction Arena</div>
        <div className="mt-1 flex w-full justify-between text-[7px] font-bold uppercase leading-none text-arena-muted sm:text-[9px]">
          {"Bidding Platform".split("").map((char, index) => (
            <span key={`${char}-${index}`}>{char === " " ? "\u00a0" : char}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="container-x flex min-h-[56px] items-center justify-between gap-3 px-3 sm:min-h-20 sm:px-4">
        <div className="shrink-0">
          <Brand />
        </div>
        <nav className="hidden min-w-0 flex-1 items-center gap-2 overflow-x-auto lg:flex">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-arena-muted transition hover:bg-white/10 hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="red-button hidden sm:inline-flex">Login</Link>
        </div>
      </div>
      <div className="border-t border-white/10 px-3 py-1.5 lg:hidden">
        <nav className="mobile-nav-scroll">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="mobile-nav-link">
              {label}
            </Link>
          ))}
          <Link href="/login" className="mobile-nav-link bg-arena-red/15 text-white">Login</Link>
        </nav>
      </div>
    </header>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="arena-shell">
      <TopNav />
      {children}
    </main>
  );
}

export function AppShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="arena-shell">
      <TopNav />
      <section className="min-h-screen">
        <div className="border-b border-white/10 bg-black/45 px-4 py-5 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="container-x flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="gold-kicker">Auction Arena</div>
              <h1 className="text-3xl leading-tight tracking-tight sm:text-4xl">{title}</h1>
              <p className="mt-2 max-w-3xl text-sm text-arena-muted">{subtitle}</p>
            </div>
          </div>
        </div>
        <div className="container-x p-3 sm:p-6 lg:p-8">{children}</div>
      </section>
    </main>
  );
}

function isImageSource(value?: string) {
  return Boolean(value?.startsWith("data:image") || value?.startsWith("http"));
}

export function PlayerCard({ player, featured = false }: { player: Player; featured?: boolean }) {
  return (
    <div className={featured ? "red-card overflow-hidden" : "glass-card overflow-hidden"}>
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
        {isImageSource(player.photo) ? (
          <img src={player.photo} alt={player.name} className="h-16 w-16 shrink-0 rounded-xl object-cover shadow-redglow sm:h-20 sm:w-20 sm:rounded-2xl" />
        ) : (
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-arena-red/80 to-arena-gold/80 text-xl text-white shadow-redglow sm:h-20 sm:w-20 sm:rounded-2xl sm:text-2xl">
            {player.photo}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-arena-red/15 px-3 py-1 text-xs font-semibold text-red-200">{player.category}</span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-arena-muted">{player.status}</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold leading-snug sm:text-xl">{player.name}</h3>
          <p className="text-sm text-arena-muted">{player.role}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
            <div>
              <div className="text-xs tracking-widest text-arena-muted">Base</div>
              <div className="text-lg font-semibold text-arena-gold">Rs. {player.basePrice}L</div>
            </div>
            <div className="text-sm text-arena-muted sm:text-right">{player.stats}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeamPurse({ team }: { team: Team }) {
  const remaining = team.purse - team.spent;
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {isImageSource(team.logo) ? (
            <img src={team.logo} alt={team.name} className="h-10 w-10 shrink-0 rounded-xl object-cover" />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-xl" style={{ background: team.color }} />
          )}
          <div className="min-w-0">
            <div className="font-semibold leading-snug">{team.name}</div>
            <div className="text-xs text-arena-muted">{team.owner}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-arena-gold">Rs. {remaining}L</div>
          <div className="text-xs text-arena-muted">{team.squad} players</div>
        </div>
      </div>
    </div>
  );
}

export function AuctionPreview() {
  const player = players[0];
  return (
    <div className="red-card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-black/30 px-5 py-4">
        <div className="min-w-0">
          <div className="gold-kicker">Live Auction Preview</div>
          <div className="mt-1 single-line text-sm font-semibold text-arena-muted">Lot 09 | Marquee Round</div>
        </div>
        <div className="shrink-0 rounded-full border border-arena-red/40 bg-arena-red/15 px-4 py-2 text-sm font-semibold text-red-100">00:24</div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_190px]">
        <div className="min-w-0">
          <div className="flex gap-4">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-arena-red to-arena-neon text-3xl font-semibold text-white shadow-redglow">
              {player.photo}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-arena-red/15 px-3 py-1 text-xs font-semibold text-red-100">{player.category}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-arena-muted">{player.role}</span>
              </div>
              <h3 className="mt-3 single-line text-3xl font-semibold leading-tight">{player.name}</h3>
              <p className="mt-2 text-sm leading-6 text-arena-muted">{player.stats}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Base", `Rs. ${player.basePrice}L`],
                ["Current Bid", "Rs. 240L"]
              ].map(([label, value]) => (
                <div key={label} className="metric-card">
                  <div className="single-line text-xs tracking-widest text-arena-muted">{label}</div>
                  <div className="mt-1 single-line text-lg font-semibold">{value}</div>
                </div>
              ))}
            </div>
            <div className="metric-card">
              <div className="single-line text-xs tracking-widest text-arena-muted">Leader</div>
              <div className="mt-1 single-line text-xl font-semibold">Delhi Voltage</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="gold-kicker">Bid Feed</div>
          <div className="mt-4 space-y-3">
            {[
              ["Delhi Voltage", "Rs. 240L"],
              ["Mumbai Meteors", "Rs. 230L"],
              ["Chennai Titans", "Rs. 220L"]
            ].map(([team, bid]) => (
              <div key={team} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="single-line text-sm font-semibold">{team}</div>
                <div className="mt-1 single-line text-xs text-arena-gold">{bid}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { players, teams };

