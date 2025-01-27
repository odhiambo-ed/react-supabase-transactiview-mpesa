import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Only POST method is allowed" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Simulated Quikk Callback Data
    // In a real scenario, this would be sent by Quikk to your callback URL.
    const callbackData = await req.json();
    const { transaction_id, result_code, result_desc } = callbackData;

    if (!transaction_id || !result_code) {
      return new Response(
        JSON.stringify({ error: "Invalid callback data" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Update the transaction in Supabase
    const { error } = await supabase
      .from("transactions")
      .update({
        status: result_code === "0" ? "success" : "failed",
        result_code,
        result_desc,
        transaction_id, // Update with Quikk's transaction ID
      })
      .eq("mpesa_receipt_number", transaction_id);

    if (error) {
      console.error("Error updating transaction:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update transaction" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({ status: "success", message: "Callback processed" }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error("Error processing callback:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});