import Link from "next/link";
import { AuctionDirectory } from "@/components/AuctionDirectory";
import { BrandLogo } from "@/components/BrandLogo";
import { PageShell } from "@/components/ui";
import { pricingPlans } from "@/lib/pricing";

const quickActions = [
  ["Watch auctions", "View live or upcoming leagues.", "/spectator", "red"],
  ["Create tournament", "Choose admin or owner bidding.", "/admin", "dark"],
  ["Bid as owner", "Rs. 499 login after approval.", "/spectator", "dark"]
];

const roleFlow = [
  ["Admin", "Creates tournaments, manages setup, approves owners, controls timer and sold/unsold decisions."],
  ["Owner", "Uses a personal account, joins approved teams, and places bids in owner-bidding tournaments."],
  ["Spectator", "Browses the league directory and opens live auctions without bidding access."],
  ["Projector", "Displays the active auction in a venue-friendly full-screen broadcast layout."]
];

const modes = [
  ["Owner-bidding", "Admin sets tournament, teams, purse, players and base prices. Owners bid only after approval. Admin finalizes timer, sold and unsold."],
  ["Admin-managed", "Admin sets everything and also places/accepts bids for teams from the live auction room."]
];

const setupSteps = [
  "Create admin account",
  "Create tournament",
  "Choose auction mode",
  "Add teams, owners, purse and players",
  "Publish league as upcoming",
  "Start auction and control live room"
];

const platformChecks = [
  ["Private admin workspace", "Admins only access leagues they create."],
  ["Shared public directory", "All visitors can see upcoming and live leagues."],
  ["Approval-based owner entry", "Owners need admin approval before bidding."],
  ["Admin-controlled auction result", "Timer, sold, unsold and next player stay with admin."]
];

export default function HomePage() {
  return (
    <PageShell>
      <section className="px-3 py-3 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
        <div className="container-x">
          <div className="red-card p-4 sm:p-5 lg:p-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
              <div className="min-w-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <BrandLogo variant="full" className="w-[180px] shrink-0 sm:w-[260px]" priority />
                  <div className="min-w-0">
                    <div className="gold-kicker">Auction Arena</div>
                    <h1 className="mt-2 max-w-3xl text-3xl leading-tight tracking-tight sm:text-4xl lg:text-[2.65rem]">
                      Multi-league sports auctions, live bidding, and broadcast view in one platform
                    </h1>
                  </div>
                </div>
                <p className="mt-4 max-w-4xl text-sm leading-6 text-arena-muted sm:text-base">
                  Built for multiple admins, public viewers, approved owners, and venue-ready auction displays. Admin-managed leagues include 3 teams free; owner self-bidding leagues bill approved owner logins.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {quickActions.map(([title, body, href, tone]) => (
                    <Link key={title} href={href} className={`${tone === "red" ? "red-button" : "dark-button"} min-h-[74px] flex-col items-start rounded-2xl px-4 py-3 text-left`}>
                      <span className="text-sm font-semibold">{title}</span>
                      <span className="mt-1 text-xs font-medium leading-5 opacity-85">{body}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="hidden gap-3 xl:grid">
                {platformChecks.map(([title, body]) => (
                  <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
                    <h2 className="single-line text-sm font-semibold">{title}</h2>
                    <p className="mt-1 text-xs leading-5 text-arena-muted">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="container-x">
          <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:hidden">
            {platformChecks.map(([title, body]) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <h2 className="text-sm font-semibold">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-arena-muted">{body}</p>
              </div>
            ))}
          </div>
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <div className="gold-kicker">Public League Board</div>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Browse live and upcoming auctions</h2>
            </div>
            <Link href="/spectator" className="dark-button w-fit">Open Full Spectator Lobby</Link>
          </div>
          <AuctionDirectory />
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="container-x grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-card p-4 sm:p-6">
            <div className="gold-kicker">User Paths</div>
            <h2 className="mt-3 text-3xl font-semibold leading-tight">Everyone enters from the right place</h2>
            <p className="mt-4 text-sm leading-7 text-arena-muted">
              Home is not a single tournament screen. It is the public doorway for viewers, owners, and multiple admins hosting different leagues.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {roleFlow.map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-arena-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="container-x">
          <div className="mb-5">
            <div className="gold-kicker">Tournament Setup</div>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Two ways to run a league</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {modes.map(([title, body]) => (
              <div key={title} className="red-card p-4 sm:p-6">
                <h3 className="text-2xl font-semibold">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-arena-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="container-x grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="glass-card p-4 sm:p-6">
            <div className="gold-kicker">Admin Workflow</div>
            <h2 className="mt-3 text-3xl font-semibold leading-tight">From empty league to live auction</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {setupSteps.map((step, index) => (
              <div key={step} className="glass-card p-5">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-arena-red text-sm font-semibold text-white">{index + 1}</div>
                <div className="mt-4 font-semibold">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="container-x">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <div className="gold-kicker">Pricing By Auction Mode</div>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Simple billing for admin or owner-run bidding</h2>
            </div>
            <Link href="/pricing" className="dark-button w-fit">See Full Pricing</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pricingPlans.map((plan) => (
              <Link key={plan.name} href="/pricing" className={`${plan.highlight ? "red-card" : "glass-card"} relative p-5 transition hover:-translate-y-1 hover:border-arena-red/40`}>
                {plan.highlight && <div className="absolute right-4 top-4 rounded-full border border-arena-gold/30 bg-arena-gold/10 px-3 py-1 text-xs font-semibold text-arena-gold">Start Here</div>}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-3 text-2xl font-semibold text-arena-gold">{plan.price}</div>
                <p className="mt-3 text-sm leading-6 text-arena-muted">{plan.audience}</p>
                <p className="mt-3 text-sm leading-6 text-arena-muted">{plan.advantage}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <div className="container-x red-card p-6 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <div className="gold-kicker">Ready To Start</div>
              <h2 className="mt-3 text-3xl font-semibold leading-tight">Create your admin account, publish a league, and let users enter through the correct view.</h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/admin" className="red-button">Login / Create Admin</Link>
              <Link href="/spectator" className="dark-button">View Auctions</Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
