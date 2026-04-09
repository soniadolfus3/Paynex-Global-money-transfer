"use client";

import { Globe, HandCoins, HelpCircle, Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOutUser, status, userProfile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const authenticated = status === "authenticated";
  const navLinks = authenticated
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/recipients", label: "Recipients" },
        { href: "/send", label: "Send money" },
      ]
    : [
        { href: "/", label: "Personal" },
        { href: "/dashboard", label: "Business" },
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#163300] text-[#9fe870] shadow-[0_14px_30px_rgba(159,232,112,0.22)]">
            <HandCoins className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-2xl font-semibold tracking-tight text-slate-950">Paynex</div>
            <div className="text-xs text-slate-500">Global money movement</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-semibold transition ${
                pathname === item.href ? "text-slate-950" : "text-slate-500 hover:text-slate-950"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button type="button" className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Globe className="h-4 w-4" />
            English
          </button>
          <button type="button" className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <HelpCircle className="h-4 w-4" />
            Help
          </button>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {authenticated ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                <UserRound className="h-4 w-4" />
                Hi, {userProfile?.name ?? "there"}
              </div>
              <button
                type="button"
                onClick={async () => {
                  await signOutUser();
                  router.push("/login");
                }}
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700">
                Log in
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-[#9fe870] px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[#8bdb5b]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-full border border-slate-200 p-2 text-slate-950 md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-slate-200 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl px-3 py-2 text-slate-700 transition hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={authenticated ? "/dashboard" : "/login"}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-center font-semibold text-white"
            >
              Continue
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

