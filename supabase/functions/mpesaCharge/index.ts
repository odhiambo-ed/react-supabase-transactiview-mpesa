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