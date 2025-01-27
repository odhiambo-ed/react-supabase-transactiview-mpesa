import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  console.log("handle-transaction-update invoked");
  return new Response(
    JSON.stringify({ message: "OK" }),
    {
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    }
  );
});