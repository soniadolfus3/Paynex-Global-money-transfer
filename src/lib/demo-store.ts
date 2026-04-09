import { recipients as seedRecipients, transfers as seedTransfers } from "@/lib/mock-data";
import type { Recipient, TransferRecord } from "@/lib/types";

const RECIPIENTS_KEY = "paynex-sandbox-recipients";
const TRANSFERS_KEY = "paynex-sandbox-transfers";
const SEED_VERSION_KEY = "paynex-sandbox-seed-version";
const SEED_VERSION = "3";

function isBrowser() {
  return typeof window !== "undefined";
}

function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function ensureSandboxSeed() {
  if (!isBrowser()) {
    return;
  }

  const currentVersion = window.localStorage.getItem(SEED_VERSION_KEY);
  const shouldResetSeeds = currentVersion !== SEED_VERSION;

  if (shouldResetSeeds || !window.localStorage.getItem(RECIPIENTS_KEY)) {
    writeStorage(RECIPIENTS_KEY, seedRecipients);
  }

  if (shouldResetSeeds || !window.localStorage.getItem(TRANSFERS_KEY)) {
    writeStorage(TRANSFERS_KEY, seedTransfers);
  }

  window.localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
}

export function getSandboxRecipients() {
  ensureSandboxSeed();
  return readStorage<Recipient[]>(RECIPIENTS_KEY, seedRecipients);
}

export function getSandboxTransfers() {
  ensureSandboxSeed();
  return readStorage<TransferRecord[]>(TRANSFERS_KEY, seedTransfers);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatRecipientBank(bank: string, accountSuffix: string) {
  return `${bank} account ending in ${accountSuffix}`;
}

export function parseRecipientBank(bankLabel: string) {
  const match = bankLabel.match(/^(.*)\saccount ending in\s(\d+)$/i);

  if (!match) {
    return {
      bankName: bankLabel,
      accountSuffix: "",
    };
  }

  return {
    bankName: match[1],
    accountSuffix: match[2],
  };
}

export function addSandboxRecipient(input: {
  name: string;
  bank: string;
  country: string;
  currency: string;
  flag: string;
  accountSuffix: string;
}) {
  const nextRecipient: Recipient = {
    id: `${slugify(input.name)}-${Date.now()}`,
    name: input.name,
    initials: buildInitials(input.name),
    bank: formatRecipientBank(input.bank, input.accountSuffix),
    country: input.country,
    currency: input.currency.toUpperCase(),
    flag: input.flag.toUpperCase(),
    accountSuffix: input.accountSuffix,
    lastTransfer: new Date().toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };

  const nextRecipients = [nextRecipient, ...getSandboxRecipients()];
  writeStorage(RECIPIENTS_KEY, nextRecipients);
  return nextRecipient;
}

export function updateSandboxRecipient(
  recipientId: string,
  input: {
    name: string;
    bank: string;
    country: string;
    currency: string;
    flag: string;
    accountSuffix: string;
  },
) {
  const previousRecipient = getSandboxRecipients().find((recipient) => recipient.id === recipientId);
  if (!previousRecipient) {
    return null;
  }

  const updatedRecipient: Recipient = {
    ...previousRecipient,
    name: input.name,
    initials: buildInitials(input.name),
    bank: formatRecipientBank(input.bank, input.accountSuffix),
    country: input.country,
    currency: input.currency.toUpperCase(),
    flag: input.flag.toUpperCase(),
    accountSuffix: input.accountSuffix,
  };

  const nextRecipients = getSandboxRecipients().map((recipient) =>
    recipient.id === recipientId ? updatedRecipient : recipient,
  );
  writeStorage(RECIPIENTS_KEY, nextRecipients);

  const nextTransfers = getSandboxTransfers().map((transfer) => {
    if (transfer.recipientName !== previousRecipient.name) {
      return transfer;
    }

    const amountMatch = transfer.amountLocal.match(/^([A-Z]{3})\s(.+)$/);
    const amountValue = amountMatch ? amountMatch[2] : transfer.amountLocal;

    return {
      ...transfer,
      recipientName: updatedRecipient.name,
      destination: updatedRecipient.country,
      amountLocal: `${updatedRecipient.currency} ${amountValue}`,
    };
  });
  writeStorage(TRANSFERS_KEY, nextTransfers);

  return updatedRecipient;
}

export function deleteSandboxRecipient(recipientId: string) {
  const recipientToDelete = getSandboxRecipients().find((recipient) => recipient.id === recipientId);
  if (!recipientToDelete) {
    return;
  }

  const nextRecipients = getSandboxRecipients().filter((recipient) => recipient.id !== recipientId);
  writeStorage(RECIPIENTS_KEY, nextRecipients);

  const nextTransfers = getSandboxTransfers().filter(
    (transfer) => transfer.recipientName !== recipientToDelete.name,
  );
  writeStorage(TRANSFERS_KEY, nextTransfers);
}

export function addSandboxTransfer(input: {
  recipientName: string;
  destination: string;
  deliveryMethod: string;
  amountCad: number;
  amountLocal: number;
  currency: string;
  status: TransferRecord["status"];
}) {
  const nextTransfer: TransferRecord = {
    id: `tx-${Date.now()}`,
    recipientName: input.recipientName,
    destination: input.destination,
    deliveryMethod: input.deliveryMethod,
    amount: `CAD ${input.amountCad.toFixed(2)}`,
    amountLocal: `${input.currency} ${input.amountLocal.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    status: input.status,
    updatedAt: new Date().toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  };

  const nextTransfers = [nextTransfer, ...getSandboxTransfers()];
  writeStorage(TRANSFERS_KEY, nextTransfers);
  return nextTransfer;
}
