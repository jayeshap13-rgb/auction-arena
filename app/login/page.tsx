import Link from "next/link";
import { PageShell } from "@/components/ui";

const entries = [
  ["Admin organizer", "Create tournaments, add teams and operate auctions.", "/admin", "red"],
  ["Team owner", "Choose a league first, then open that league's owner login and bidding view.", "/spectator", "dark"],
  ["Public viewer", "Browse live and upcoming auctions without an account.", "/spectator", "dark"]
];

export default function LoginPage() {
  return (
    <PageShell>
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="container-x grid min-h-[70vh] place-items-center">
          <div className="red-card w-full max-w-4xl p-6 sm:p-8">
            <div className="gold-kicker">Login</div>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Choose how you want to enter Auction Arena</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-arena-muted">
              Admins manage tournaments and payment unlocks. Owners bid only after approval. Viewers can watch public auctions.
            </p>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {entries.map(([title, body, href, tone]) => (
                <Link key={title} href={href} className={`${tone === "red" ? "red-button" : "dark-button"} min-h-[130px] flex-col items-start rounded-2xl p-5 text-left`}>
                  <span className="text-lg font-semibold">{title}</span>
                  <span className="mt-2 text-sm font-medium leading-6 opacity-85">{body}</span>
                </Link>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/pricing" className="dark-button">View Pricing</Link>
              <Link href="/" className="dark-button">Back Home</Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
