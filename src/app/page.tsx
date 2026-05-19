import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
      <div className="fade-up mx-auto max-w-2xl text-center">
        <div className="chip mb-6 inline-flex">Genesis Founder Launch</div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          <span className="blessup-gradient-text">BlessUP</span>{" "}
          <span className="text-[rgb(var(--fg-primary))]">Launchpad</span>
        </h1>

        <p className="mb-10 text-lg text-[rgb(var(--fg-secondary))]">
          Become a Genesis Founder. Purchase your Founder NFT, complete the
          Sprint, and access the ACTX token presale at exclusive founder
          pricing.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/nft" className="btn btn-primary px-8 py-3 text-base">
            Get Your Founder NFT
          </Link>
          <Link href="/presale" className="btn btn-ghost px-8 py-3 text-base">
            View Presale
          </Link>
        </div>
      </div>

      <div className="gradient-divider mx-auto mt-24 w-full max-w-md" />

      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {[
          { step: "01", title: "Founder NFT", desc: "Elite or Legend tier" },
          { step: "02", title: "Genesis Sprint", desc: "3-day onboarding" },
          { step: "03", title: "ACTX Presale", desc: "Founder pricing" },
        ].map((item) => (
          <div key={item.step} className="text-center">
            <div className="mb-2 font-mono text-sm text-[rgb(var(--nft-accent))]">
              {item.step}
            </div>
            <div className="font-semibold text-[rgb(var(--fg-primary))]">
              {item.title}
            </div>
            <div className="text-sm text-[rgb(var(--fg-muted))]">
              {item.desc}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
