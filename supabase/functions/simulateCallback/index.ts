import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Invalid request method. Only POST is allowed." }),
        { status: 405 }
      );
    }

    const { ref, status } = await req.json();

    await supabase.from("transactions").update({ status }).eq("mpesa_receipt_number", ref);

    return new Response(JSON.stringify({ status: "success" }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ status: "error", message: "Callback failed" }), { status: 500 });
  }
});