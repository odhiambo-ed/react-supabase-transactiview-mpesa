// supabase/functions/http-bridge/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  try {
    const { url, body } = await req.json();

    if (!url || !body) {
      return new Response(
        JSON.stringify({ error: "Missing url or body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return new Response(
      JSON.stringify({ data }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: response.status,
      }
    );
  } catch (error) {
    // Assert the error as an instance of Error to access the message property
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});