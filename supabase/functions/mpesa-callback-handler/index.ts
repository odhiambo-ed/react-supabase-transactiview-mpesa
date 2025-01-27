import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import process from "node:process";

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function handleCallback(req: { json: () => PromiseLike<{ transaction_id: unknown; status: unknown; }> | { transaction_id: unknown; status: unknown; }; }) {
  const { transaction_id, status } = await req.json();

  const { data, error } = await supabase
    .from("transactions")
    .update({ status })
    .match({ id: transaction_id });

  if (error) {
    console.error("Failed to update transaction:", error);
    return new Response(JSON.stringify({ error: "Failed to update transaction" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ status: "success", data }), {
    headers: { "Content-Type": "application/json" },
  });
}

export default handleCallback;