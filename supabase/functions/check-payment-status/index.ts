import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing required environment variables");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

Deno.serve(async (req) => {
  // Handle Preflight Requests (CORS) for all methods
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow requests from any origin
        "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS", // Allowed methods
        "Access-Control-Allow-Headers": "Content-Type, Authorization", // Allowed headers
      },
    });
  }

  try {
    const url = new URL(req.url);
    const transactionId = url.searchParams.get("transactionId");

    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: "Transaction ID is required" }),
        {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          status: 400,
        }
      );
    }

    const { data, error } = await supabase
      .from("transaction_status_view")
      .select("*")
      .eq("id", transactionId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: "Transaction not found" }),
        {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          status: 404,
        }
      );
    }

    return new Response(JSON.stringify({ status: data.status, data }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        status: 500,
      }
    );
  }
});