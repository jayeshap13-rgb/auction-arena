import Link from "next/link";
import { FeatureExplorer } from "@/components/FeatureExplorer";
import { PageShell } from "@/components/ui";
import { pricingPlans } from "@/lib/pricing";

export default function FeaturesPage() {
  return (
    <PageShell>
      <section className="px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <div className="container-x">
          <div className="red-card p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <div className="gold-kicker">Features</div>
                <h1 className="mt-4 max-w-4xl text-3xl leading-tight sm:text-4xl lg:text-5xl">
                  Explore the auction platform by role, workflow, and tournament mode
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-7 text-arena-muted">
                  Auction Arena supports multiple admins, multiple leagues, owner approvals, public viewing, live auction control, and broadcast displays in one frontend prototype.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link href="/admin" className="red-button">Start as Admin</Link>
                <Link href="/spectator" className="dark-button">View Auctions</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 pt-2 sm:px-6 lg:px-8">
        <div className="container-x">
          <FeatureExplorer />
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 lg:px-8">
        <div className="container-x">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <div className="gold-kicker">Pricing Advantages</div>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Pricing scales only when team count grows</h2>
            </div>
            <Link href="/pricing" className="dark-button w-fit">Open Pricing</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={`${plan.highlight ? "red-card" : "glass-card"} p-5`}>
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-2 text-sm leading-6 text-arena-muted">{plan.audience}</p>
                <div className="mt-4 text-2xl font-semibold text-arena-gold">{plan.price}</div>
                <p className="mt-3 text-sm leading-6 text-arena-muted">{plan.advantage}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
