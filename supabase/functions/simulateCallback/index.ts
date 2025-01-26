import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY") as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function simulateCallback(transactionId: string) {
  // Simulate a delay for the callback
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Simulate a successful transaction
  const status = "completed";
  const callbackData = {
    status,
    transactionId,
    message: "Transaction completed successfully",
  };

  // Update the transaction status
  const { error: updateError } = await supabase
    .from("transactions")
    .update({ status, completed_at: new Date() })
    .eq("id", transactionId);

  if (updateError) {
    console.error("Error updating transaction status:", updateError);
    return;
  }

  // Insert the callback data into the payment_callbacks table
  const { error: insertError } = await supabase
    .from("payment_callbacks")
    .insert([{ transaction_id: transactionId, callback_data: callbackData }]);

  if (insertError) {
    console.error("Error inserting callback data:", insertError);
  }
}