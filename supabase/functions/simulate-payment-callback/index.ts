// simulate-payment-callback.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

Deno.serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { transaction_id, result_code } = await req.json();

    if (!transaction_id) {
      return new Response(
        JSON.stringify({ error: "transaction_id is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Simulate success or failure (optional)
    const isSuccess = Math.random() < 0.8; // 80% chance of success

    // Update transaction status
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        status: result_code === 0 ? "success" : "failed", // Update based on the provided result_code
        result_code: result_code.toString(), // Store the result code in the database
        result_desc: result_code === 0 ? "Transaction successful" : "Transaction failed", // Store the result description
      })
      .eq("mpesa_receipt_number", transaction_id);

    if (updateError) {
      console.error("Error updating transaction status:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update transaction status" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Fetch the transaction to get the ID for the foreign key reference
    const { data: transaction, error: fetchError } = await supabase
      .from("transactions")
      .select("id")
      .eq("mpesa_receipt_number", transaction_id)
      .single();

    if (fetchError) {
      console.error("Error fetching transaction:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch transaction" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Insert callback data into payment_callbacks table
    const dummyCallbackData = {
      result_code: result_code, // Use the provided result_code
      result_desc: result_code === 0 ? "Transaction successful" : "Transaction failed", // Use appropriate message based on result_code
      transaction_id: transaction_id,
    };

    const { error: insertError } = await supabase
      .from("payment_callbacks")
      .insert({
        transaction_id: transaction.id, // Use the fetched transaction ID
        callback_data: dummyCallbackData,
      });

    if (insertError) {
      console.error("Error inserting into payment_callbacks:", insertError);
      return new Response(
        JSON.stringify({
          error: "Failed to insert into payment_callbacks",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Callback simulated successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error simulating payment callback:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});