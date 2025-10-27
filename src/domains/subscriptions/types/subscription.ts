export interface SubChannelLink {
  name: string;
  link: string;
  views?: number;
  last_accessed?: string;
}

export interface Subscription {
  id: number;
  name: string;
  status: "نشط" | "منتهي" | "unknown";
  expiry: string;
  start_date: string;
  progress: number;
  invite_link: string | null;
  sub_channel_links: SubChannelLink[] | null;
  price?: string | number;
  selectedOption?: string | null;
  description?: string;
  features?: string[];
  terms_and_conditions?: string[];
  animation?: object;
  subscriptionOptions?: string[];
  color?: string;
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
  meta?: {
    total: number;
    active: number;
    expired: number;
  };
}
