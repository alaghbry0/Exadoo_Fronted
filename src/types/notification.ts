// types/notification.ts
export type SocketMessageType = {
  type: 'unread_update' | 'subscription_renewed' | 'notification'
  data?: {
    count?: number
    message?: string
    invite_link?: string
    [key: string]: unknown
  }
}

export type NotificationType = {
  id: number
  type: 'subscription_renewal' | 'payment_success' | 'system_alert' | string
  title?: string
  message: string
  created_at: string
  read_status: boolean
  extra_data?: {
    subscription_history_id?: number
    payment_token?: string
    [key: string]: unknown
  }
  subscription_history?: SubscriptionHistoryType
}

export type SubscriptionHistoryType = {
  invite_link?: string
  subscription_type_name?: string
  subscription_plan_name?: string
  renewal_date?: string
  expiry_date?: string
  telegram_id?: number
  amount?: number
  currency?: string
  payment_method?: string
  transaction_id?: string
  [key: string]: unknown
}
