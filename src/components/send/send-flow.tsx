"use client";

import {
  Banknote,
  Bolt,
  CheckCircle2,
  CreditCard,
  Landmark,
  MoveLeft,
  Pencil,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import {
  addSandboxTransfer,
  getSandboxRecipients,
  parseRecipientBank,
  updateSandboxRecipient,
} from "@/lib/demo-store";
import { recipients } from "@/lib/mock-data";
import type { Recipient } from "@/lib/types";

type DeliveryOption = "express" | "economy";

type RecipientEditor = {
  name: string;
  bank: string;
  country: string;
  currency: string;
  flag: string;
  accountSuffix: string;
};

const FEES = { express: 1.99, economy: 0.99 };
const CORRIDOR_RATES: Record<string, { express: number; economy: number }> = {
  GBP: { express: 0.57, economy: 0.58 },
  PHP: { express: 41.12, economy: 41.55 },
  MXN: { express: 12.18, economy: 12.41 },
  KRW: { express: 979.4, economy: 988.6 },
  SGD: { express: 0.97, economy: 0.99 },
  INR: { express: 60.92, economy: 61.48 },
  NGN: { express: 1118.4, economy: 1132.8 },
};

function flagFromCode(code: string) {
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((char) => 127397 + char.charCodeAt(0)),
  );
}

function buildSelfRecipient(): Recipient {
  return {
    id: "your-global-account",
    name: "Your global account",
    initials: "YG",
    bank: "Paynex multi-currency balance ending in 1044",
    country: "United Kingdom",
    currency: "GBP",
    flag: "GB",
    accountSuffix: "1044",
    lastTransfer: new Date().toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

function toEditorState(recipient: Recipient): RecipientEditor {
  const parsedBank = parseRecipientBank(recipient.bank);

  return {
    name: recipient.name,
    bank: parsedBank.bankName,
    country: recipient.country,
    currency: recipient.currency,
    flag: recipient.flag,
    accountSuffix: recipient.accountSuffix || parsedBank.accountSuffix,
  };
}

function toRecipient(recipient: Recipient, editor: RecipientEditor): Recipient {
  return {
    ...recipient,
    name: editor.name,
    initials: editor.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join(""),
    bank: `${editor.bank} account ending in ${editor.accountSuffix}`,
    country: editor.country,
    currency: editor.currency.toUpperCase(),
    flag: editor.flag.toUpperCase(),
    accountSuffix: editor.accountSuffix,
  };
}

function getRatesForCurrency(currency: string) {
  return CORRIDOR_RATES[currency.toUpperCase()] ?? { express: 1, economy: 1.02 };
}

export function SendFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipientId = searchParams.get("recipient");
  const isSelfTransfer = searchParams.get("self") === "true";
  const { status } = useAuth();
  const [storedRecipients, setStoredRecipients] = useState<Recipient[]>(recipients);
  const [sendAmount, setSendAmount] = useState("150");
  const [receiveAmountInput, setReceiveAmountInput] = useState("");
  const [lastEditedField, setLastEditedField] = useState<"send" | "receive">("send");
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>("economy");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isEditingRecipient, setIsEditingRecipient] = useState(false);
  const [recipientEditor, setRecipientEditor] = useState<RecipientEditor>({
    name: "",
    bank: "",
    country: "",
    currency: "",
    flag: "",
    accountSuffix: "",
  });

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

  const selectedRecipient = useMemo(() => {
    if (isSelfTransfer) {
      return buildSelfRecipient();
    }

    return storedRecipients.find((item) => item.id === recipientId) ?? null;
  }, [isSelfTransfer, recipientId, storedRecipients]);

  const displayRecipient = useMemo(() => {
    if (!selectedRecipient) {
      return null;
    }

    if (!isEditingRecipient) {
      return selectedRecipient;
    }

    return toRecipient(selectedRecipient, recipientEditor);
  }, [isEditingRecipient, recipientEditor, selectedRecipient]);

  const numericAmount = Number.parseFloat(sendAmount || "0");
  const rates = getRatesForCurrency(displayRecipient?.currency ?? selectedRecipient?.currency ?? "CAD");
  const rate = rates[deliveryOption];
  const numericReceiveInput = Number.parseFloat(receiveAmountInput || "0");
  const computedSendAmount = useMemo(
    () =>
      lastEditedField === "send"
        ? Number((numericAmount || 0).toFixed(2))
        : Number((((numericReceiveInput || 0) / rate) || 0).toFixed(2)),
    [lastEditedField, numericAmount, numericReceiveInput, rate],
  );
  const computedReceiveAmount = useMemo(
    () =>
      lastEditedField === "receive"
        ? Number((numericReceiveInput || 0).toFixed(2))
        : Number((((numericAmount || 0) * rate) || 0).toFixed(2)),
    [lastEditedField, numericAmount, numericReceiveInput, rate],
  );
  const total = (computedSendAmount + FEES[deliveryOption]).toFixed(2);

  function saveRecipientChanges() {
    if (!selectedRecipient) {
      return;
    }

    if (isSelfTransfer) {
      setIsEditingRecipient(false);
      setConfirmationText("Updated your personal destination details for this transfer.");
      return;
    }

    const updatedRecipient = updateSandboxRecipient(selectedRecipient.id, recipientEditor);
    if (updatedRecipient) {
      setStoredRecipients(getSandboxRecipients());
      setConfirmationText("Recipient details updated.");
    }
    setIsEditingRecipient(false);
  }

  async function handleContinue() {
    if (!displayRecipient || Number.isNaN(computedSendAmount) || computedSendAmount <= 0) {
      setConfirmationText("Enter a valid amount and choose a recipient before continuing.");
      return;
    }

    setIsSubmitting(true);

    const nextTransfer = addSandboxTransfer({
      recipientName: displayRecipient.name,
      destination: displayRecipient.country,
      deliveryMethod:
        deliveryOption === "express" ? "Card payment" : "Bank or Interac transfer",
      amountCad: computedSendAmount,
      amountLocal: computedReceiveAmount,
      currency: displayRecipient.currency,
      status: deliveryOption === "express" ? "In progress" : "Delivered",
    });

    setConfirmationText(`Transfer ${nextTransfer.id} created. Redirecting to dashboard...`);
    window.setTimeout(() => {
      router.push("/dashboard");
    }, 700);
  }

  if (status === "loading") {
    return <div className="px-4 py-16 text-center text-slate-500">Preparing transfer...</div>;
  }

  if (!selectedRecipient || !displayRecipient) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
          <h1 className="text-3xl font-semibold text-slate-950">Choose a recipient first</h1>
          <p className="mt-3 text-slate-600">
            Start from the recipient screen so this transfer can use a saved contact instead of a placeholder.
          </p>
          <Link
            href="/recipients"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 font-semibold text-white"
          >
            Go to recipients
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/recipients" className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
            <MoveLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="hidden h-2 w-full max-w-xl overflow-hidden rounded-full bg-slate-200 sm:block">
            <div className="h-full w-2/3 rounded-full bg-[#163300]" />
          </div>
          <div className="hidden text-sm font-medium text-slate-500 sm:block">Step 2 of 3</div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-medium text-slate-500">Recipient</div>
                <button
                  type="button"
                  onClick={() => {
                    if (isEditingRecipient) {
                      saveRecipientChanges();
                      return;
                    }

                    setRecipientEditor(toEditorState(selectedRecipient));
                    setIsEditingRecipient(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  {isEditingRecipient ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  {isEditingRecipient ? "Save recipient" : "Edit recipient"}
                </button>
              </div>

              {isEditingRecipient ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">Name</span>
                    <input
                      value={recipientEditor.name}
                      onChange={(event) =>
                        setRecipientEditor((current) => ({ ...current, name: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#163300]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">Bank</span>
                    <input
                      value={recipientEditor.bank}
                      onChange={(event) =>
                        setRecipientEditor((current) => ({ ...current, bank: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#163300]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">Country</span>
                    <input
                      value={recipientEditor.country}
                      onChange={(event) =>
                        setRecipientEditor((current) => ({ ...current, country: event.target.value }))
                      }
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#163300]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">Currency</span>
                    <input
                      value={recipientEditor.currency}
                      onChange={(event) =>
                        setRecipientEditor((current) => ({
                          ...current,
                          currency: event.target.value.toUpperCase(),
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#163300]"
                      maxLength={3}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">Flag code</span>
                    <input
                      value={recipientEditor.flag}
                      onChange={(event) =>
                        setRecipientEditor((current) => ({
                          ...current,
                          flag: event.target.value.toUpperCase(),
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#163300]"
                      maxLength={2}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">Account suffix</span>
                    <input
                      value={recipientEditor.accountSuffix}
                      onChange={(event) =>
                        setRecipientEditor((current) => ({
                          ...current,
                          accountSuffix: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#163300]"
                    />
                  </label>
                </div>
              ) : (
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-2xl font-semibold text-slate-950">{displayRecipient.name}</div>
                    <div className="mt-1 text-slate-600">{displayRecipient.bank}</div>
                    <div className="mt-1 text-sm text-slate-400">
                      {displayRecipient.country} • {displayRecipient.currency}
                    </div>
                  </div>
                  <div className="rounded-full bg-[#eff9e7] px-3 py-1 text-lg">
                    {flagFromCode(displayRecipient.flag)}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 p-5">
              <div className="space-y-6">
                <label className="block">
                  <span className="text-sm font-medium text-slate-500">You send</span>
                  <div className="mt-2 flex items-center justify-between border-b border-slate-200 pb-4">
                    <input
                      type="number"
                      min="1"
                      step="10"
                      value={
                        lastEditedField === "send"
                          ? sendAmount
                          : Number.isFinite(computedSendAmount)
                            ? computedSendAmount.toFixed(2)
                            : ""
                      }
                      onChange={(event) => {
                        setLastEditedField("send");
                        setSendAmount(event.target.value);
                      }}
                      className="w-full bg-transparent text-5xl font-semibold text-slate-700 outline-none"
                    />
                    <div className="rounded-full bg-slate-100 px-4 py-2 text-xl font-semibold text-slate-950">
                      CAD
                    </div>
                  </div>
                </label>

                <div>
                  <span className="text-sm font-medium text-slate-500">They receive</span>
                  <div className="mt-2 flex items-center justify-between pt-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        lastEditedField === "receive"
                          ? receiveAmountInput
                          : Number.isFinite(computedReceiveAmount)
                            ? computedReceiveAmount.toFixed(2)
                            : ""
                      }
                      onChange={(event) => {
                        setLastEditedField("receive");
                        setReceiveAmountInput(event.target.value);
                      }}
                      className="w-full bg-transparent text-5xl font-semibold text-slate-700 outline-none"
                    />
                    <div className="rounded-full bg-slate-100 px-4 py-2 text-xl font-semibold text-slate-950">
                      {displayRecipient.currency}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-slate-950">Delivery speed</h2>
              <div className="mt-5 space-y-4">
                {[
                  {
                    id: "express",
                    title: "Express",
                    description: "Money arrives instantly",
                    paymentLabel: "Pay with debit or credit card",
                    rate: rates.express,
                    icon: Bolt,
                    paymentIcon: CreditCard,
                  },
                  {
                    id: "economy",
                    title: "Economy",
                    description: "Money arrives within 9 hours",
                    paymentLabel: "Pay with bank or Interac e-Transfer",
                    rate: rates.economy,
                    icon: Banknote,
                    paymentIcon: Landmark,
                  },
                ].map((option) => {
                  const isSelected = deliveryOption === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDeliveryOption(option.id as DeliveryOption)}
                      className={`flex w-full items-start gap-4 rounded-[1.75rem] border p-5 text-left transition ${
                        isSelected
                          ? "border-[#163300] bg-[#f5fbf0] shadow-[0_14px_30px_rgba(22,51,0,0.08)]"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <div
                        className={`mt-2 h-6 w-6 rounded-full border-2 ${
                          isSelected ? "border-[#163300]" : "border-slate-400"
                        }`}
                      >
                        <div
                          className={`m-1 h-2.5 w-2.5 rounded-full ${
                            isSelected ? "bg-[#163300]" : "bg-transparent"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-3xl font-semibold text-slate-950">{option.title}</div>
                        <div className="mt-3 flex items-center gap-2 text-slate-700">
                          <option.icon className="h-4 w-4" />
                          {option.description}
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-slate-700">
                          <option.paymentIcon className="h-4 w-4" />
                          {option.paymentLabel}
                        </div>
                        <div className="mt-4 text-3xl font-semibold text-[#163300]">
                          1 CAD = {option.rate} {displayRecipient.currency}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
              <div className="text-2xl font-semibold text-slate-950">
                {deliveryOption === "express" ? "Money arrives instantly" : "Money arrives within 9 hours"}
              </div>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-slate-600">Fee</span>
                  <span className="font-semibold text-slate-950">CAD {FEES[deliveryOption].toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="text-slate-600">Exchange rate</span>
                  <span className="font-semibold text-slate-950">
                    1 CAD = {rates[deliveryOption]} {displayRecipient.currency}
                  </span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex items-center justify-between text-2xl">
                  <span className="font-semibold text-slate-950">Total</span>
                  <span className="font-semibold text-[#163300]">CAD {total}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={isSubmitting || isEditingRecipient}
              className="w-full rounded-[1.25rem] bg-slate-950 px-5 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving transfer..." : "Continue"}
            </button>

            <p className="text-sm leading-6 text-slate-500">
              This is a frontend sandbox. Recipient details, transfer amount, and the chosen speed all remain editable.
            </p>

            {confirmationText ? (
              <div className="rounded-[1.75rem] border border-[#cfe7be] bg-[#eff9e7] p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#163300]" />
                  <div>
                    <div className="text-xl font-semibold text-[#163300]">Transfer updated</div>
                    <p className="mt-2 text-[#274d06]">{confirmationText}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
