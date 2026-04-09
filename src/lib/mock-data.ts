import type { DashboardSnapshot, Recipient, TransferRecord, UserProfile } from "@/lib/types";

export const featuredDestinations = [
  { name: "India", flag: "IN" },
  { name: "Philippines", flag: "PH" },
  { name: "Mexico", flag: "MX" },
  { name: "Pakistan", flag: "PK" },
  { name: "Kenya", flag: "KE" },
  { name: "Brazil", flag: "BR" },
];

export const supportedCountries = [
  "Albania",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Belgium",
  "Belize",
  "Benin",
  "Bermuda",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Bulgaria",
  "Cambodia",
  "Cameroon",
  "Cayman Islands",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Costa Rica",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
];

export const recipients: Recipient[] = [
  {
    id: "emma-wilson",
    name: "Emma Wilson",
    initials: "EW",
    bank: "Barclays account ending in 4182",
    country: "United Kingdom",
    currency: "GBP",
    flag: "GB",
    accountSuffix: "4182",
    lastTransfer: "Apr 2, 2026",
  },
  {
    id: "mateo-santos",
    name: "Mateo Santos",
    initials: "MS",
    bank: "BDO account ending in 6624",
    country: "Philippines",
    currency: "PHP",
    flag: "PH",
    accountSuffix: "6624",
    lastTransfer: "Apr 3, 2026",
  },
  {
    id: "lucia-navarro",
    name: "Lucia Navarro",
    initials: "LN",
    bank: "BBVA account ending in 8307",
    country: "Mexico",
    currency: "MXN",
    flag: "MX",
    accountSuffix: "8307",
    lastTransfer: "Apr 4, 2026",
  },
  {
    id: "daniel-kim",
    name: "Daniel Kim",
    initials: "DK",
    bank: "KOOKMIN Bank account ending in 2156",
    country: "South Korea",
    currency: "KRW",
    flag: "KR",
    accountSuffix: "2156",
    lastTransfer: "Apr 5, 2026",
  },
  {
    id: "maya-chen",
    name: "Maya Chen",
    initials: "MC",
    bank: "DBS account ending in 9071",
    country: "Singapore",
    currency: "SGD",
    flag: "SG",
    accountSuffix: "9071",
    lastTransfer: "Apr 6, 2026",
  },
  {
    id: "noah-patel",
    name: "Noah Patel",
    initials: "NP",
    bank: "Kotak Mahindra Bank account ending in 5549",
    country: "India",
    currency: "INR",
    flag: "IN",
    accountSuffix: "5549",
    lastTransfer: "Apr 7, 2026",
  },
  {
    id: "amara-okafor",
    name: "Amara Okafor",
    initials: "AO",
    bank: "GTBank account ending in 3018",
    country: "Nigeria",
    currency: "NGN",
    flag: "NG",
    accountSuffix: "3018",
    lastTransfer: "Apr 8, 2026",
  },
];

export const transfers: TransferRecord[] = [
  {
    id: "tx-101",
    recipientName: "Emma Wilson",
    destination: "United Kingdom",
    deliveryMethod: "Bank transfer",
    amount: "CAD 220.00",
    amountLocal: "GBP 126.40",
    status: "Delivered",
    updatedAt: "Today, 10:40 AM",
  },
  {
    id: "tx-102",
    recipientName: "Mateo Santos",
    destination: "Philippines",
    deliveryMethod: "Wallet deposit",
    amount: "CAD 160.00",
    amountLocal: "PHP 6,682.00",
    status: "In progress",
    updatedAt: "Today, 9:15 AM",
  },
  {
    id: "tx-103",
    recipientName: "Lucia Navarro",
    destination: "Mexico",
    deliveryMethod: "Cash pickup",
    amount: "CAD 100.00",
    amountLocal: "MXN 1,243.50",
    status: "Ready for pickup",
    updatedAt: "Yesterday, 6:20 PM",
  },
];

export const defaultUserProfile: UserProfile = {
  name: "Sonia",
  email: "sonia@paynex.app",
  tier: "Personal",
  preferredDestination: "India",
};

export function createDashboardSnapshot(tick = 0): DashboardSnapshot {
  const baseRate = 66.37;
  const drift = Math.sin(tick / 2) * 0.28;
  const fee = 1.99 + ((tick % 3) * 0.1);

  return {
    rate: Number((baseRate + drift).toFixed(2)),
    corridorLabel: "CAD to INR",
    fee: Number(fee.toFixed(2)),
    syncedAt: new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}

export function getRecipientById(recipientId?: string | null) {
  return recipients.find((recipient) => recipient.id === recipientId) ?? recipients[0];
}
