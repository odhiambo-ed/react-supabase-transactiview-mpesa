import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.4";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";

// Load environment variables
const QUIKK_URL = Deno.env.get("QUIKK_URL") as string;
const QUIKK_KEY = Deno.env.get("QUIKK_KEY") as string;
const QUIKK_SECRET = Deno.env.get("QUIKK_SECRET") as string;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;

if (!QUIKK_URL || !QUIKK_KEY || !QUIKK_SECRET || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing required environment variables");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function generateHmacSignature() {
  const timestamp = new Date().toUTCString();
  const toEncode = `date: ${timestamp}`;
  const hmac = crypto.createHmac("SHA256", QUIKK_SECRET).update(toEncode).digest();
  const encoded = Buffer.from(hmac).toString("base64");
  const urlEncoded = encodeURIComponent(encoded);
  const authString = `keyId="${QUIKK_KEY}",algorithm="hmac-sha256",headers="date",signature="${urlEncoded}"`;
  return [timestamp, authString];
}

async function makePostRequest(body: string) {
  const [timestamp, authString] = generateHmacSignature();

  const headers = {
    "Content-Type": "application/vnd.api+json",
    "date": timestamp,
    "Authorization": authString,
  };

  const response = await fetch(QUIKK_URL, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error in Quikk API Request:", response.status, errorData, response);
    throw new Error(errorData.errorMessage || "Unknown error occurred");
  }

  return response.json();
}

Deno.serve(async (req) => {
  try {
    console.log("Incoming request:", req.url);

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Invalid request method. Only POST is allowed." }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Parse request body and validate required fields
    const { phone, ref, amount, code } = await req.json();
    if (!phone || !ref || !amount || !code) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Check if the transaction already exists
    const { data: existingTransaction, error: fetchError } = await supabase
      .from("transactions")
      .select("id")
      .eq("mpesa_receipt_number", ref)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking existing transaction:", fetchError);
      return new Response(
        JSON.stringify({ status: "error", message: "Error checking existing transaction." }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    if (existingTransaction) {
      return new Response(
        JSON.stringify({ status: "error", message: "Transaction already exists." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Insert a new record into the transactions table
    const { error: insertError } = await supabase
      .from("transactions")
      .insert([{ amount, status: "pending", mpesa_receipt_number: ref, phone }]);

    if (insertError) {
      console.error("Failed to insert billing record:", insertError);
      return new Response(
        JSON.stringify({ status: "error", message: "Failed to initiate transaction." }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const requestBody = {
      data: {
        id: ref,
        type: "charge",
        attributes: {
          amount: amount,
          posted_at: new Date().toISOString(),
          reference: "TestRef",
          short_code: "174379",
          customer_no: phone,
          customer_type: "msisdn",
        },
      },
    };

    const responseData = await makePostRequest(JSON.stringify(requestBody));

    return new Response(
      JSON.stringify({ status: "success", data: responseData }),
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