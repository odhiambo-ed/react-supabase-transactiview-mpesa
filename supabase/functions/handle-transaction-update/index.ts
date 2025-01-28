import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.4";

// Load environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing required environment variables");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    // Extract transactionId from the request body
    const transactionId = body?.transactionId; // Correctly extract transactionId

    if (!transactionId) {
      console.error("Transaction ID not found in the request body.");
      return new Response(
        JSON.stringify({ error: "Transaction ID is required" }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(
      "handle-transaction-update invoked for transaction:",
      transactionId,
    );

    // Simulate payment processing time
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Randomly determine success or failure (90% success, 10% failure)
    const isSuccess = Math.random() < 0.9;
    const newStatus = isSuccess ? "completed" : "failed";

    // Fetch the transaction first
    const { data: transactionData, error: transactionError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (transactionError) {
      throw new Error(
        `Failed to fetch transaction: ${transactionError.message}`,
      );
    }

    // Update transaction status
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        status: newStatus,
        completed_at: isSuccess ? new Date().toISOString() : null,
      })
      .eq("id", transactionId);

    if (updateError) {
      throw new Error(`Failed to update transaction: ${updateError.message}`);
    }

    // If successful, insert dummy callback data
    if (isSuccess) {
      const dummyCallbackData = {
        Body: {
          stkCallback: {
            MerchantRequestID: "dummy-merchant-req-id",
            CheckoutRequestID: "dummy-checkout-req-id",
            ResultCode: 0,
            ResultDesc: "The service request is processed successfully.",
            CallbackMetadata: {
              Item: [
                {
                  Name: "Amount",
                  Value: transactionData.amount, // Use fetched amount
                },
                {
                  Name: "MpesaReceiptNumber",
                  Value: transactionData.mpesa_receipt_number, // Use fetched mpesa_receipt_number
                },
                {
                  Name: "TransactionDate",
                  Value: new Date().toISOString(),
                },
                {
                  Name: "PhoneNumber",
                  Value: transactionData.phone, // Use fetched phone number
                },
              ],
            },
          },
        },
      };

      const { error: callbackError } = await supabase
        .from("payment_callbacks")
        .insert({
          transaction_id: transactionId,
          callback_data: dummyCallbackData,
        });

      if (callbackError) {
        throw new Error(
          `Failed to insert callback data: ${callbackError.message}`,
        );
      }
    }

    return new Response(
      JSON.stringify({ message: "Transaction updated successfully" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating transaction:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});