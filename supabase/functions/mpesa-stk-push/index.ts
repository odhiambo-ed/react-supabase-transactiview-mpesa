import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.4";
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
    console.error("Error in Quikk API Request:", response.status, errorData);
    throw new Error(errorData.errorMessage || "Unknown error occurred");
  }

  return response.json();
}

Deno.serve(async (req) => {
  try {
    // Handle Preflight Requests (CORS)
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

    const { phone, amount, ref: reference } = await req.json();

    if (!phone || !amount || !reference) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Generate a unique transaction ID to be used as mpesa_receipt_number
    const transactionId = crypto.randomUUID();

    // Insert new transaction (status: pending)
    const { data: insertedTransaction, error: insertError } = await supabase
      .from("transactions")
      .insert({
        mpesa_receipt_number: transactionId, // Use generated ID
        phone,
        amount,
        status: "pending",
      })
      .select();

    if (insertError) {
      console.error("Transaction insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create transaction" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Prepare request body for Quikk API
    const requestBody = JSON.stringify({
      data: {
        id: transactionId, // Use the same transaction ID
        type: "charge",
        attributes: {
          amount: amount,
          posted_at: new Date().toISOString(),
          reference: reference,
          short_code: "174379",
          customer_no: phone,
          customer_type: "msisdn",
        },
      },
    });

    // Make request to Quikk API
    const responseData = await makePostRequest(requestBody);

    // Return success response with resourceId from Quikk API
    return new Response(
      JSON.stringify({
        status: "success",
        data: responseData,
        transaction_id: insertedTransaction[0].id,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error("Error processing request:", error);
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