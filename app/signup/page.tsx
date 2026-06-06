import Link from "next/link";
import { PageShell } from "@/components/ui";
import { pricingPlans } from "@/lib/pricing";

export default function SignupPage() {
  return (
    <PageShell>
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="container-x">
          <div className="red-card p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <div className="gold-kicker">Start Setup</div>
                <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Create an admin account and start your tournament free</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-arena-muted">
                  Start in the admin dashboard, create your tournament, and choose admin-managed or owner self-bidding billing.
                </p>
              </div>
              <Link href="/admin" className="red-button w-fit">Create Admin Account</Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pricingPlans.map((plan) => (
              <Link key={plan.name} href="/admin" className={`${plan.highlight ? "red-card" : "glass-card"} relative p-5 transition hover:-translate-y-1 hover:border-arena-red/40`}>
                {plan.highlight && <div className="absolute right-4 top-4 rounded-full border border-arena-gold/30 bg-arena-gold/10 px-3 py-1 text-xs font-semibold text-arena-gold">Start Here</div>}
                <h2 className="text-xl font-semibold">{plan.name}</h2>
                <div className="mt-3 text-2xl font-semibold text-arena-gold">{plan.price}</div>
                <p className="mt-3 text-sm leading-6 text-arena-muted">{plan.advantage}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
