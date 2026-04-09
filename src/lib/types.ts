export type Recipient = {
  id: string;
  name: string;
  initials: string;
  bank: string;
  country: string;
  currency: string;
  flag: string;
  accountSuffix: string;
  lastTransfer: string;
};

export type TransferRecord = {
  id: string;
  recipientName: string;
  destination: string;
  deliveryMethod: string;
  amount: string;
  amountLocal: string;
  status: "Delivered" | "In progress" | "Ready for pickup";
  updatedAt: string;
};

export type UserProfile = {
  name: string;
  email: string;
  tier: "Personal" | "Business";
  preferredDestination: string;
};

export type DashboardSnapshot = {
  rate: number;
  corridorLabel: string;
  fee: number;
  syncedAt: string;
};

