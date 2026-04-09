import {
  ArrowRight,
  Download,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { featuredDestinations, supportedCountries } from "@/lib/mock-data";

function flagFromCode(code: string) {
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((char) => 127397 + char.charCodeAt(0)),
  );
}

export function HomePage() {
  return (
    <main className="pb-20">
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-full border border-[#cfe7be] bg-[#eff9e7] px-4 py-3 text-center text-sm font-semibold text-[#163300]">
          Special first transfer offer. Explore the Paynex sandbox with zero fees on your first route.
        </div>

        <div className="grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Cross-border product concept
            </div>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Money moves globally. The experience should still feel simple.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Paynex is a frontend-focused fintech experience inspired by modern global transfer
              products: clean rates, confident forms, responsive dashboards, and a calm send flow.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
              >
                Start demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-base font-semibold text-slate-950 transition hover:border-slate-950"
              >
                Open dashboard
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["FX corridors", "100+"],
                ["Markets served", "175+"],
                ["Live update pattern", "Realtime"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-sm text-slate-500">{label}</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-950">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_right,_rgba(159,232,112,0.24),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(24,189,149,0.18),_transparent_30%)]" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_35px_90px_rgba(15,23,42,0.09)]">
              <div className="rounded-[1.75rem] bg-[#163300] p-6 text-white">
                <div className="text-sm uppercase tracking-[0.2em] text-[#d9f6c9]">Paynex rate</div>
                <div className="mt-3 text-5xl font-semibold">1 CAD = 66.37 INR</div>
                <div className="mt-3 text-base text-[#d9f6c9]">Mid-market aligned preview</div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-slate-200 p-5">
                  <div className="text-sm font-medium text-slate-500">You send</div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-4xl font-semibold text-slate-950">500</div>
                    <div className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                      {flagFromCode("CA")} CAD
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 p-5">
                  <div className="text-sm font-medium text-slate-500">Recipient gets</div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-4xl font-semibold text-slate-950">33,185</div>
                    <div className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                      {flagFromCode("IN")} INR
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] bg-[#f5fbf0] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-slate-500">Estimated delivery</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-950">Today, within 9 hours</div>
                  </div>
                  <Link
                    href="/recipients"
                    className="rounded-full bg-[#9fe870] px-5 py-3 font-semibold text-slate-950 transition hover:bg-[#8bdb5b]"
                  >
                    Send money
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3">
          {[
            {
              title: "Clear rate presentation",
              body: "The most important number sits up front, paired with fee context and speed.",
              icon: TrendingUp,
            },
            {
              title: "Trust without clutter",
              body: "Compliance cues and reassurance stay present without making the product feel heavy.",
              icon: ShieldCheck,
            },
            {
              title: "Fast path to action",
              body: "Returning customers can jump from dashboard to recipient to checkout in a few taps.",
              icon: Zap,
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[1.5rem] bg-slate-50 p-5">
              <item.icon className="h-8 w-8 text-emerald-700" />
              <h2 className="mt-4 text-2xl font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-2 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-[#0f2f2a] px-6 py-12 text-white sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight">Fast. Familiar. Global.</h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-emerald-50/85">
                A polished marketing surface, supported-country grid, app promotion band, and a transfer
                quote module that all feel part of the same system.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <div className="rounded-[1.5rem] border border-white/15 bg-white/5 px-5 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-emerald-100/80">Get it on</div>
                  <div className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                    <Download className="h-5 w-5" />
                    Google Play
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-white/15 bg-white/5 px-5 py-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-emerald-100/80">Download on</div>
                  <div className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                    <Download className="h-5 w-5" />
                    App Store
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
              <div className="text-sm uppercase tracking-[0.2em] text-emerald-100/80">Popular corridors</div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {featuredDestinations.map((country) => (
                  <div key={country.name} className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-lg">
                      {flagFromCode(country.flag)}
                    </div>
                    <div>
                      <div className="font-semibold">{country.name}</div>
                      <div className="text-sm text-emerald-100/75">Available now</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            We serve over 175 countries and territories around the world
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A broad destination directory adds confidence and product scale to the landing page.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {supportedCountries.map((country, index) => (
            <div key={country} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className={`h-3.5 w-3.5 rounded-full ${index % 2 === 0 ? "bg-emerald-500" : "bg-sky-500"}`} />
              <span className="text-base font-medium text-slate-700">{country}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-20 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            ["Company", "About", "Blog", "Newsroom", "Careers"],
            ["Products", "Send money", "Business payouts", "Rate alerts", "Referral rewards"],
            ["Resources", "Rates and fees", "Swift codes", "Fraud prevention", "Currency converter"],
            ["Support", "Help center", "Contact", "Privacy", "User agreement"],
          ].map(([heading, ...links]) => (
            <div key={heading}>
              <h3 className="text-xl font-semibold text-slate-950">{heading}</h3>
              <ul className="mt-5 space-y-4 text-slate-600">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="transition hover:text-slate-950">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </main>
  );
}
