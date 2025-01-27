import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing required environment variables");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

Deno.serve(async (req) => {
  try {
    const { record: newTransaction } = await req.json();

    if (newTransaction && newTransaction.status === 'pending') {
      // Simulate payment processing time
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Randomly determine success or failure (90% success, 10% failure)
      const isSuccess = Math.random() < 0.9;
      const newStatus = isSuccess ? "completed" : "failed";

      // Update transaction status
      const { error: updateError } = await supabase
        .from("transactions")
        .update({
          status: newStatus,
          completed_at: isSuccess ? new Date().toISOString() : null,
        })
        .eq("id", newTransaction.id);

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
                    Value: newTransaction.amount,
                  },
                  {
                    Name: "MpesaReceiptNumber",
                    Value: newTransaction.mpesa_receipt_number,
                  },
                  {
                    Name: "TransactionDate",
                    Value: new Date().toISOString(),
                  },
                  {
                    Name: "PhoneNumber",
                    Value: newTransaction.phone,
                  },
                ],
              },
            },
          },
        };

        const { error: callbackError } = await supabase
          .from("payment_callbacks")
          .insert({
            transaction_id: newTransaction.id,
            callback_data: dummyCallbackData,
          });

        if (callbackError) {
          throw new Error(
            `Failed to insert callback data: ${callbackError.message}`
          );
        }
      }
    }

    return new Response(JSON.stringify({ message: "Transaction updated" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error handling transaction update:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});