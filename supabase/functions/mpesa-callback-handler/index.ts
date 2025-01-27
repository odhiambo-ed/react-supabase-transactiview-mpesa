import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.4";

// const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
// const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;
// const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") as string;

// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

Deno.serve(async (req) => {
  try {
    // CORS Preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-webhook-secret",
        },
      });
    }

    if (req.method === "GET" || req.method === "POST") {
      // Handle GET or POST request
      // Your existing logic here...
      // Example response for demonstration
      return new Response(
        JSON.stringify({ message: "Request handled successfully" }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Method Not Allowed" }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
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