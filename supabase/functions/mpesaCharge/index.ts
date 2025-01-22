import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.4";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";

// Load environment variables
const QUIKK_URL = Deno.env.get("QUIKK_URL");
const QUIKK_KEY = Deno.env.get("QUIKK_KEY");
const QUIKK_SECRET = Deno.env.get("QUIKK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

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
