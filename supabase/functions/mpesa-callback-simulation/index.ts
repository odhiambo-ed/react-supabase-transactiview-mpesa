// File: supabase/functions/mpesa-callback-simulation/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") as string;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

Deno.serve(async (req) => {
  try {
    // Validate request method
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Only POST method is allowed" }),
        { status: 405 }
      );
    }

    // Get pending transactions
    const { data: pendingTransactions, error: fetchError } = await supabase
      .from('transactions')
      .select('id, mpesa_receipt_number, amount, phone')
      .eq('status', 'pending')
      .limit(5);

    if (fetchError) {
      console.error('Error fetching pending transactions:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch transactions' }), 
        { status: 500 }
      );
    }

    const simulationResults = [];

    for (const transaction of pendingTransactions) {
      // Simulate callback (70% success, 30% failure)
      const status = Math.random() < 0.7 ? 'completed' : 'failed';
      
      const callbackData = {
        transaction_id: transaction.id,
        mpesa_receipt_number: transaction.mpesa_receipt_number,
        amount: transaction.amount,
        phone: transaction.phone,
        status: status,
        timestamp: new Date().toISOString(),
        ...(status === 'failed' && { 
          error_reason: 'Insufficient funds or network error' 
        })
      };

      // Simulate sending callback to callback handler
      const callbackResponse = await fetch(
        `${SUPABASE_URL}/functions/v1/mpesa-callback-handler`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': WEBHOOK_SECRET
          },
          body: JSON.stringify(callbackData)
        }
      );

      simulationResults.push({
        transactionId: transaction.id,
        status: status,
        callbackStatus: callbackResponse.status
      });
    }

    return new Response(
      JSON.stringify({ 
        message: 'Callback simulation completed', 
        simulatedTransactions: simulationResults 
      }), 
      { status: 200 }
    );
  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500 }
    );
  }
});