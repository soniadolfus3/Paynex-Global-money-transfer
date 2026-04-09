"use client";

import { ArrowRight, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import {
  addSandboxRecipient,
  deleteSandboxRecipient,
  getSandboxRecipients,
  parseRecipientBank,
  updateSandboxRecipient,
} from "@/lib/demo-store";
import { recipients } from "@/lib/mock-data";
import type { Recipient } from "@/lib/types";

type RecipientFormState = {
  name: string;
  bank: string;
  country: string;
  currency: string;
  flag: string;
  accountSuffix: string;
};

const EMPTY_FORM: RecipientFormState = {
  name: "",
  bank: "",
  country: "India",
  currency: "INR",
  flag: "IN",
  accountSuffix: "",
};

function flagFromCode(code: string) {
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((char) => 127397 + char.charCodeAt(0)),
  );
}

function toFormState(recipient: Recipient): RecipientFormState {
  const parsed = parseRecipientBank(recipient.bank);

  return {
    name: recipient.name,
    bank: parsed.bankName,
    country: recipient.country,
    currency: recipient.currency,
    flag: recipient.flag,
    accountSuffix: recipient.accountSuffix || parsed.accountSuffix,
  };
}

export function RecipientsView() {
  const router = useRouter();
  const { status } = useAuth();
  const [storedRecipients, setStoredRecipients] = useState<Recipient[]>(recipients);
  const [isAdding, setIsAdding] = useState(false);
  const [editingRecipientId, setEditingRecipientId] = useState<string | null>(null);
  const [formState, setFormState] = useState<RecipientFormState>(EMPTY_FORM);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setStoredRecipients(getSandboxRecipients());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function beginCreate() {
    setEditingRecipientId(null);
    setFormState(EMPTY_FORM);
    setIsAdding(true);
  }

  function beginEdit(recipient: Recipient) {
    setEditingRecipientId(recipient.id);
    setFormState(toFormState(recipient));
    setIsAdding(true);
  }

  function refreshRecipients() {
    setStoredRecipients(getSandboxRecipients());
  }

  function closeForm() {
    setIsAdding(false);
    setEditingRecipientId(null);
    setFormState(EMPTY_FORM);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingRecipientId) {
      const updatedRecipient = updateSandboxRecipient(editingRecipientId, formState);
      refreshRecipients();
      closeForm();
      if (updatedRecipient) {
        router.push(`/send?recipient=${updatedRecipient.id}`);
      }
      return;
    }

    const nextRecipient = addSandboxRecipient(formState);
    refreshRecipients();
    closeForm();
    router.push(`/send?recipient=${nextRecipient.id}`);
  }

  function handleDelete(recipientId: string) {
    deleteSandboxRecipient(recipientId);
    refreshRecipients();
    if (editingRecipientId === recipientId) {
      closeForm();
    }
  }

  if (status === "loading") {
    return <div className="px-4 py-16 text-center text-slate-500">Loading recipients...</div>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:p-8">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Step 1</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            Who are you sending to?
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Create, edit, or remove recipients and move straight into the transfer flow.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={beginCreate}
            className="rounded-[1.5rem] border border-slate-200 p-5 text-left transition hover:border-slate-950 hover:shadow-lg"
          >
            <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-900">
              <Plus className="h-6 w-6" />
            </div>
            <div className="mt-4 text-2xl font-semibold text-slate-950">New recipient</div>
            <p className="mt-2 text-slate-600">
              Save a new payout contact with editable bank, country, currency, and account details.
            </p>
          </button>

          <Link
            href="/send?self=true"
            className="rounded-[1.5rem] border border-slate-200 p-5 transition hover:border-slate-950 hover:shadow-lg"
          >
            <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-900">
              <UserRound className="h-6 w-6" />
            </div>
            <div className="mt-4 text-2xl font-semibold text-slate-950">Yourself</div>
            <p className="mt-2 text-slate-600">
              Send into a personal overseas balance and edit the transfer amount on the next step.
            </p>
          </Link>
        </div>

        {isAdding ? (
          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-4 rounded-[1.5rem] border border-[#cfe7be] bg-[#f5fbf0] p-5 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <div className="text-2xl font-semibold text-slate-950">
                {editingRecipientId ? "Edit recipient" : "Add recipient"}
              </div>
              <div className="mt-1 text-slate-600">
                Changes save locally and appear across quick send, transfer history, and the send flow.
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Recipient name</span>
              <input
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, name: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#163300]"
                placeholder="Ava Patel"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Bank name</span>
              <input
                value={formState.bank}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, bank: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#163300]"
                placeholder="Barclays"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Country</span>
              <input
                value={formState.country}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, country: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#163300]"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Currency</span>
              <input
                value={formState.currency}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    currency: event.target.value.toUpperCase(),
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#163300]"
                placeholder="GBP"
                maxLength={3}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Flag code</span>
              <input
                value={formState.flag}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, flag: event.target.value.toUpperCase() }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#163300]"
                placeholder="GB"
                maxLength={2}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Account suffix</span>
              <input
                value={formState.accountSuffix}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, accountSuffix: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#163300]"
                placeholder="2048"
                required
              />
            </label>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                {editingRecipientId ? "Save changes" : "Save and continue"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-10">
          <h2 className="text-3xl font-semibold text-slate-950">Recent recipients</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {storedRecipients.map((recipient) => (
              <div
                key={recipient.id}
                className="rounded-[1.5rem] border border-slate-200 px-5 py-5 transition hover:border-emerald-400 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-xl font-semibold text-slate-950">
                      {recipient.initials}
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-slate-950">{recipient.name}</div>
                      <div className="mt-1 text-slate-600">{recipient.bank}</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {recipient.country} • {recipient.currency} • Last transfer {recipient.lastTransfer}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-full bg-[#eff9e7] px-3 py-1 text-lg">{flagFromCode(recipient.flag)}</div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/send?recipient=${recipient.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 font-semibold text-white"
                  >
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => beginEdit(recipient)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(recipient.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 font-semibold text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
