import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">

      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center">
            <span className="text-yellow-400 font-black text-sm">$</span>
          </div>
          <span className="text-lg font-extrabold text-zinc-900 tracking-tight">SknMoney</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-bold bg-zinc-950 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-400/15 border border-yellow-400/30 text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-full mb-8 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            Free for roommates
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-black text-zinc-900 tracking-tight leading-[1.05] mb-6">
            Split bills.<br />
            <span className="text-yellow-400">No drama.</span>
          </h1>

          {/* Sub */}
          <p className="text-lg text-zinc-500 leading-relaxed mb-10 max-w-md mx-auto">
            SknMoney tracks who paid what, splits it fairly, and tells everyone exactly who owes whom — so you never have that awkward money conversation again.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-bold px-8 py-3.5 rounded-xl transition-colors text-sm"
            >
              Create a free account
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Feature strip */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto w-full">
          <FeatureCard
            icon="💳"
            title="Log any expense"
            desc="Record who paid, choose who benefits, split equally or set custom amounts per person."
          />
          <FeatureCard
            icon="⚖️"
            title="Balances, simplified"
            desc="Our algorithm turns messy group debts into the fewest possible payments to settle up."
          />
          <FeatureCard
            icon="✓"
            title="Mark as paid"
            desc="When someone pays you back in real life, tap Confirm Received and the balance updates instantly."
          />
        </div>

        {/* Dark section */}
        <div className="mt-16 bg-zinc-950 rounded-3xl p-10 max-w-3xl mx-auto w-full text-center">
          <p className="text-zinc-400 text-sm uppercase tracking-widest font-semibold mb-3">
            Built for
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Apartments", "Students", "Travel groups", "Flatmates", "Co-living spaces"].map((tag) => (
              <span
                key={tag}
                className="bg-zinc-800 text-zinc-300 text-sm font-medium px-4 py-2 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-white font-extrabold text-2xl mt-8 mb-2">
            Ready to stop chasing people for money?
          </p>
          <p className="text-zinc-500 text-sm mb-6">Set up your first group in under a minute.</p>
          <Link
            href="/signup"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-bold px-8 py-3 rounded-xl transition-colors text-sm"
          >
            Get started free
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-zinc-400">
        © {new Date().getFullYear()} SknMoney · Free for everyone
      </footer>

    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-6 text-left">
      <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center text-lg mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-zinc-900 text-base mb-1.5">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
