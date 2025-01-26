// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

// const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
// const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// serve(async (req) => {
//   try {
//     if (req.method !== "POST") {
//       return new Response("Method not allowed", { status: 405 });
//     }

//     const body = await req.json();
//     console.log("Received webhook:", body);

//     const mpesaReceiptNumber = body.data?.id;
//     const status = body.data?.attributes?.status === "success" ? "completed" : "failed";

//     if (!mpesaReceiptNumber) {
//       return new Response("Invalid callback data", { status: 400 });
//     }

//     const { data: transaction, error: findError } = await supabase
//       .from("transactions")
//       .select("id")
//       .eq("mpesa_receipt_number", mpesaReceiptNumber)
//       .single();

//     if (findError || !transaction) {
//       console.error("Transaction not found:", findError);
//       return new Response("Transaction not found", { status: 404 });
//     }

//     const { error: updateError } = await supabase
//       .from("transactions")
//       .update({ 
//         status: status,
//         completed_at: status === "completed" ? new Date().toISOString() : null
//       })
//       .eq("id", transaction.id);

//     if (updateError) {
//       console.error("Error updating transaction:", updateError);
//       return new Response("Error updating transaction", { status: 500 });
//     }

//     const { error: callbackError } = await supabase
//       .from("payment_callbacks")
//       .insert({
//         transaction_id: transaction.id,
//         callback_data: body
//       });

//     if (callbackError) {
//       console.error("Error storing callback:", callbackError);
//       return new Response("Error storing callback", { status: 500 });
//     }

//     return new Response(JSON.stringify({ success: true, message: "Callback processed successfully" }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" }
//     });

//   } catch (error) {
//     console.error("Webhook error:", error);
//     return new Response(JSON.stringify({ success: false, message: "Internal server error" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" }
//     });
//   }
// });