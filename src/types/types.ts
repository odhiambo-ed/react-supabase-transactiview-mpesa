export interface Transaction {
  id: string;
  mpesa_receipt_number: string | null;
  phone: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  created_at: string;
  completed_at: string | null;
  callback_data: unknown;
  callback_received_at: string | null;
}

export interface TransactionStats {
  total_transactions: number;
  completed_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  total_amount_completed: number;
  avg_completion_time_minutes: number;
}