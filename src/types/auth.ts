// src/types/auth.ts
export interface User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export interface AuthState {
  user: User | null
  loading: boolean
}

// src/types/transaction.ts
export interface Transaction {
  id: string
  mpesa_receipt_number: string | null
  phone: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  completed_at: string | null
  callback_data?: unknown
}

export interface TransactionStats {
  total_transactions: number
  completed_transactions: number
  pending_transactions: number
  failed_transactions: number
  total_amount_completed: number
  avg_completion_time_minutes: number
}