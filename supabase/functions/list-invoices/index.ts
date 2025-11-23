import Stripe from "https://esm.sh/stripe@14?target=denonext"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { limit = 100, status } = await req.json().catch(() => ({}))

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
      apiVersion: "2024-12-18.acacia",
    })

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // List invoices from Stripe
    const params: any = {
      limit: Math.min(limit, 100),
      expand: ['data.customer', 'data.payment_intent'],
    }

    if (status) {
      params.status = status
    }

    const invoicesResponse = await stripe.invoices.list(params)

    // Get parent information for each invoice
    const invoicesWithParents = await Promise.all(
      invoicesResponse.data.map(async (invoice) => {
        const customerId = typeof invoice.customer === 'string' 
          ? invoice.customer 
          : (invoice.customer as any)?.id

        if (!customerId) {
          return {
            ...invoice,
            parent: null,
          }
        }

        // Find parent by Stripe customer ID
        const { data: parent } = await supabaseClient
          .from("parents")
          .select("id, parent1_first_name, parent1_last_name, parent1_email")
          .eq("stripe_customer_id", customerId)
          .single()

        return {
          ...invoice,
          parent: parent || null,
        }
      })
    )

    return new Response(
      JSON.stringify({
        success: true,
        invoices: invoicesWithParents,
        hasMore: invoicesResponse.has_more,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error("Error listing invoices:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

