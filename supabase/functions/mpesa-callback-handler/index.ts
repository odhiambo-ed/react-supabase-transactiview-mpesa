import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

Deno.serve(async (req) => {
  try {
    // CORS Preflight
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

    // Validate request method
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Only POST method is allowed" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Validate webhook secret (optional but recommended)
    const providedSecret = req.headers.get("x-webhook-secret");
    if (providedSecret !== WEBHOOK_SECRET) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Parse incoming callback data
    const callbackData = await req.json();

    // Validate callback data
    if (!callbackData.transaction_id || !callbackData.status) {
      return new Response(
        JSON.stringify({ error: "Invalid callback data" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Insert callback into payment_callbacks table
    const { error: callbackInsertError } = await supabase
      .from("payment_callbacks")
      .insert({
        transaction_id: callbackData.transaction_id,
        callback_data: callbackData
      });

    if (callbackInsertError) {
      console.error("Callback insert error:", callbackInsertError);
      return new Response(
        JSON.stringify({ error: "Failed to record callback" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Update transaction status
    const { error: transactionUpdateError } = await supabase
      .from("transactions")
      .update({
        status: callbackData.status === 'completed' ? 'completed' : 'failed',
        completed_at: callbackData.status === 'completed' ? new Date().toISOString() : null
      })
      .eq("id", callbackData.transaction_id);

    if (transactionUpdateError) {
      console.error("Transaction update error:", transactionUpdateError);
      return new Response(
        JSON.stringify({ error: "Failed to update transaction" }),
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
      JSON.stringify({ status: "success", message: "Callback processed" }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ status: "error", message: "Internal server error" }),
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