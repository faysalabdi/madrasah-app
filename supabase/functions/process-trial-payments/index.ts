import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-12-18.acacia",
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Find all trial payments that have ended (trialEndDate is in the past)
    const now = new Date().toISOString()
    
    const { data: trialPayments, error } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("status", "trial_active")
      .lt("metadata->>trialEndDate", now)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    if (!trialPayments || trialPayments.length === 0) {
      return new Response(
        JSON.stringify({ message: "No trial payments to process", count: 0 }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      )
    }

    const results = []

    for (const payment of trialPayments) {
      try {
        const metadata = payment.metadata || {}
        const paymentMethodId = metadata.paymentMethodId || payment.stripe_payment_method_id
        const amount = Math.round(payment.amount * 100) // Convert to cents
        const numberOfChildren = metadata.numberOfChildren || 1
        const productSelection = metadata.productSelection || {}

        if (!paymentMethodId) {
          console.error(`No payment method ID for payment ${payment.id}`)
          continue
        }

        // Get parent to get customer ID
        const { data: parent } = await supabaseClient
          .from("parents")
          .select("stripe_customer_id")
          .eq("id", payment.parent_id)
          .single()

        if (!parent?.stripe_customer_id) {
          console.error(`No customer ID for parent ${payment.parent_id}`)
          continue
        }

        // Create Payment Intent using the saved payment method
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "aud",
          customer: parent.stripe_customer_id,
          payment_method: paymentMethodId,
          off_session: true, // Payment is happening without customer present
          confirm: true, // Automatically confirm and charge
          description: `Madrasah Enrollment - ${numberOfChildren} ${numberOfChildren === 1 ? "Child" : "Children"}`,
          metadata: {
            parent_id: payment.parent_id.toString(),
            numberOfChildren: numberOfChildren.toString(),
            trialPaymentId: payment.id.toString(),
            productSelection: JSON.stringify(productSelection),
          },
        })

        // Update payment record
        await supabaseClient
          .from("payments")
          .update({
            status: paymentIntent.status === "succeeded" ? "succeeded" : "failed",
            stripe_payment_intent_id: paymentIntent.id,
            paid_for_books: productSelection.fiqhBook || productSelection.surahsDua || productSelection.islamicStudies || false,
            paid_term_fees: productSelection.termFees || false,
            metadata: {
              ...metadata,
              paymentIntentId: paymentIntent.id,
              processedAt: new Date().toISOString(),
            },
          })
          .eq("id", payment.id)

        results.push({
          paymentId: payment.id,
          status: paymentIntent.status,
          paymentIntentId: paymentIntent.id,
        })

        console.log(`Processed trial payment ${payment.id}: ${paymentIntent.status}`)
      } catch (error) {
        console.error(`Error processing trial payment ${payment.id}:`, error)
        results.push({
          paymentId: payment.id,
          status: "error",
          error: error.message,
        })
      }
    }

    return new Response(
      JSON.stringify({
        message: "Trial payments processed",
        count: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error processing trial payments:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    )
  }
})

