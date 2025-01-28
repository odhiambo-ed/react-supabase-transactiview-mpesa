import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  try {
    const { url, body } = await req.json();

    console.log("http-bridge invoked. Target URL:", url);
    console.log("Request body:", body);

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

    console.log("Response from handle-transaction-update:", data);

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
    console.error("Error in http-bridge:", errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});