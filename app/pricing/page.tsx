import Link from "next/link";
import { PageShell } from "@/components/ui";
import { demoOffer, planAddOns, planComparison, pricingPlans } from "@/lib/pricing";

const chooser = [
  ["Creating any new tournament?", "Start free and choose the management mode."],
  ["Admin-managed with 1-3 teams?", "No payment needed."],
  ["Admin-managed with 4+ teams?", "Pay Rs. 99 for each extra team after 3."],
  ["Owner self-bidding league?", "Pay Rs. 499 for every owner login approved to bid."]
];

export default function PricingPage() {
  return (
    <PageShell>
      <section className="px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="container-x">
          <div className="red-card p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <div className="gold-kicker">Pricing</div>
                <h1 className="mt-4 max-w-4xl text-3xl leading-tight sm:text-4xl lg:text-5xl">
                  Pricing that follows how your auction is managed
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-7 text-arena-muted">
                  Admin-managed leagues are free up to 3 teams, then Rs. 99 per extra team. Owner self-bidding leagues charge Rs. 499 for every approved owner login.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link href="/admin" className="red-button">Create Tournament</Link>
                <Link href="/features" className="dark-button">Compare Features</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="container-x">
          <div className="glass-card grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <div className="gold-kicker">Pricing Rule</div>
              <h2 className="mt-2 text-2xl font-semibold">{demoOffer.name}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-arena-muted">{demoOffer.advantage}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {demoOffer.features.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-arena-muted">{item}</span>
                ))}
              </div>
            </div>
            <Link href="/admin" className="dark-button">Create Tournament</Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="container-x grid gap-5 lg:grid-cols-4">
          {pricingPlans.map((plan) => (
            <div key={plan.name} className={`${plan.highlight ? "red-card" : "glass-card"} relative flex flex-col p-6`}>
              {plan.highlight && <div className="absolute right-4 top-4 rounded-full border border-arena-gold/30 bg-arena-gold/10 px-3 py-1 text-xs font-semibold text-arena-gold">Start Here</div>}
              <h2 className="text-2xl font-semibold">{plan.name}</h2>
              <div className="mt-4 text-4xl font-semibold">{plan.price}</div>
              <p className="mt-3 text-sm leading-6 text-arena-muted">{plan.note}</p>
              <p className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-arena-muted">{plan.advantage}</p>
              <ul className="mt-6 grid gap-3 text-sm text-arena-muted">
                {plan.features.map((item) => (
                  <li key={item} className="rounded-xl border border-white/10 bg-white/5 p-3">{item}</li>
                ))}
              </ul>
              <Link href="/admin" className={`${plan.highlight ? "red-button" : "dark-button"} mt-6 w-full`}>{plan.highlight ? "Start Setup" : "Open Setup"}</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="container-x grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="glass-card p-6">
            <div className="gold-kicker">Billing Guide</div>
            <h2 className="mt-3 text-3xl font-semibold leading-tight">How will you be charged?</h2>
            <div className="mt-5 grid gap-3">
              {chooser.map(([question, answer]) => (
                <div key={question} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold">{question}</div>
                  <p className="mt-1 text-sm text-arena-muted">{answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="border-b border-white/10 p-5">
              <div className="gold-kicker">Comparison</div>
              <h2 className="mt-2 text-2xl font-semibold">Billing changes by auction mode</h2>
            </div>
            <div className="grid divide-y divide-white/10">
              <div className="hidden grid-cols-5 gap-4 bg-white/5 p-4 text-sm font-semibold md:grid">
                <div>Feature</div>
                {pricingPlans.map((plan) => <div key={plan.name}>{plan.name}</div>)}
              </div>
              {planComparison.map(([feature, freeStart, extraTeams, tournamentCap, upiBilling]) => (
                <div key={feature} className="grid gap-3 p-4 md:grid-cols-5 md:gap-4">
                  <div className="font-semibold">{feature}</div>
                  {[freeStart, extraTeams, tournamentCap, upiBilling].map((value, index) => (
                    <div key={`${feature}-${index}`} className="text-sm leading-6 text-arena-muted">{value}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="container-x">
          <div className="mb-5">
            <div className="gold-kicker">Add-ons</div>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Example charges</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {planAddOns.map(([name, price, note]) => (
              <div key={name} className="glass-card p-5">
                <h3 className="text-xl font-semibold">{name}</h3>
                <div className="mt-3 text-2xl font-semibold text-arena-gold">{price}</div>
                <p className="mt-3 text-sm leading-6 text-arena-muted">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <div className="container-x red-card p-6 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <div className="gold-kicker">Ready To Host?</div>
              <h2 className="mt-3 text-3xl font-semibold leading-tight">Create the tournament first. Admin mode bills extra teams, owner mode bills approved owner logins.</h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/admin" className="red-button">Start Setup</Link>
              <Link href="/features" className="dark-button">Review Features</Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
