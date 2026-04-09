"use client";

import {
  BarChart3,
  Bell,
  CircleDollarSign,
  Clock3,
  Plus,
  RefreshCw,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { getSandboxRecipients, getSandboxTransfers } from "@/lib/demo-store";
import { createDashboardSnapshot, recipients, transfers } from "@/lib/mock-data";
import type { Recipient, TransferRecord } from "@/lib/types";

function flagFromCode(code: string) {
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((char) => 127397 + char.charCodeAt(0)),
  );
}

export function DashboardShell() {
  const router = useRouter();
  const { status, userProfile } = useAuth();
  const [tick, setTick] = useState(0);
  const [storedRecipients, setStoredRecipients] = useState<Recipient[]>(recipients);
  const [storedTransfers, setStoredTransfers] = useState<TransferRecord[]>(transfers);
  const snapshot = createDashboardSnapshot(tick);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((current) => current + 1), 4000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setStoredRecipients(getSandboxRecipients());
      setStoredTransfers(getSandboxTransfers());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (status === "loading") {
    return <div className="px-4 py-16 text-center text-slate-500">Loading dashboard...</div>;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe7be] bg-[#eff9e7] px-4 py-2 text-sm font-semibold text-[#163300]">
              <Bell className="h-4 w-4" />
              Realtime transfer feed
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">
              Hello, {userProfile?.name ?? "there"}
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
              Monitor live corridor pricing, repeat a transfer quickly, and track the latest activity
              across your sandbox account.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Live rate", `1 CAD = ${snapshot.rate} INR`],
              ["Transfer fee", `CAD ${snapshot.fee.toFixed(2)}`],
              ["Last sync", snapshot.syncedAt],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.5rem] bg-slate-50 px-5 py-4">
                <div className="text-sm text-slate-500">{label}</div>
                <div className="mt-2 text-xl font-semibold text-slate-950">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold text-slate-950">Quick send</h2>
                <p className="mt-2 text-slate-600">Recent contacts stay one tap away for repeat transfers.</p>
              </div>
              <Link href="/recipients" className="text-sm font-semibold text-slate-950 underline">
                View all
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {storedRecipients.map((recipient) => (
                <Link
                  key={recipient.id}
                  href={`/send?recipient=${recipient.id}`}
                  className="rounded-[1.5rem] border border-slate-200 p-4 transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-xl font-semibold text-slate-950">
                      {recipient.initials}
                    </div>
                    <div className="rounded-full bg-[#eff9e7] px-2 py-1 text-sm">
                      {flagFromCode(recipient.flag)}
                    </div>
                  </div>
                  <div className="mt-4 text-xl font-semibold text-slate-950">{recipient.name}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-500">{recipient.bank}</div>
                </Link>
              ))}

              <Link
                href="/recipients"
                className="grid min-h-[12rem] place-items-center rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 text-center transition hover:border-slate-950"
              >
                <div>
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-slate-950 shadow-sm">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div className="mt-4 text-lg font-semibold text-slate-950">New contact</div>
                </div>
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold text-slate-950">Transfers</h2>
                <p className="mt-2 text-slate-600">A clean activity feed for tracking recent transfer states.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {storedTransfers.map((transfer) => {
                const recipientId =
                  storedRecipients.find((item) => item.name === transfer.recipientName)?.id ?? null;

                return (
                  <div key={transfer.id} className="rounded-[1.5rem] border border-slate-200 p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="inline-flex rounded-full bg-[#eff9e7] px-3 py-1 text-sm font-semibold text-[#163300]">
                          {transfer.status}
                        </div>
                        <div className="mt-4 text-2xl font-semibold text-slate-950">
                          {transfer.recipientName}
                        </div>
                        <div className="mt-2 text-slate-600">
                          {transfer.deliveryMethod} - {transfer.destination} - Updated {transfer.updatedAt}
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <div className="text-2xl font-semibold text-slate-950">{transfer.amountLocal}</div>
                        <div className="mt-1 text-slate-500">{transfer.amount}</div>
                        <Link
                          href={recipientId ? `/send?recipient=${recipientId}` : "/recipients"}
                          className="mt-4 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-950"
                        >
                          Send again
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-[2rem] bg-[#163300] p-6 text-white shadow-[0_24px_60px_rgba(22,51,0,0.18)]">
            <div className="flex items-center gap-3">
              <CircleDollarSign className="h-6 w-6 text-[#9fe870]" />
              <div className="text-sm uppercase tracking-[0.2em] text-[#d9f6c9]">Exchange rate</div>
            </div>
            <div className="mt-5 text-4xl font-semibold">1 CAD = {snapshot.rate} INR</div>
            <div className="mt-3 text-[#d9f6c9]">
              Sending to {userProfile?.preferredDestination ?? "India"} with low, visible fees.
            </div>
            <Link
              href="/recipients"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#9fe870] px-5 py-3 font-semibold text-slate-950 transition hover:bg-[#8bdb5b]"
            >
              <Send className="h-4 w-4" />
              Send money
            </Link>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-emerald-700" />
              <div className="text-2xl font-semibold text-slate-950">Do more with Paynex</div>
            </div>
            <div className="mt-6 space-y-4">
              {[
                "Referral rewards built into the dashboard surface",
                "Rate-tracking cues that keep the interface feeling alive",
                "Responsive card system for activity, beneficiaries, and quotes",
              ].map((item) => (
                <div key={item} className="rounded-[1.5rem] bg-slate-50 px-5 py-4 text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-slate-950" />
              <div className="text-xl font-semibold text-slate-950">Realtime profile updates</div>
            </div>
            <p className="mt-4 text-slate-600">
              When Firebase is configured, the app listens to Firestore user documents with snapshots.
              In demo mode, a timed refresh keeps the dashboard visibly active.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-slate-950" />
              <div className="text-xl font-semibold text-slate-950">Delivery estimate</div>
            </div>
            <p className="mt-4 text-slate-600">
              Economy arrives in 9 hours and express is instant for this demo corridor. The send flow
              compares both paths in a compact checkout step.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
