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
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
      apiVersion: "2024-12-18.acacia",
    })

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Get all parents who don't have a Stripe customer ID
    const { data: parents, error: parentsError } = await supabaseClient
      .from("parents")
      .select("id, parent1_first_name, parent1_last_name, parent1_email, stripe_customer_id")
      .or("stripe_customer_id.is.null,stripe_customer_id.eq.")

    if (parentsError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch parents", details: parentsError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (!parents || parents.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "All parents already have Stripe customers",
          created: 0,
          skipped: 0,
          total: 0
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    let created = 0
    let skipped = 0
    const errors: string[] = []

    // Create Stripe customers for each parent
    for (const parent of parents) {
      // Skip if already has a customer ID
      if (parent.stripe_customer_id) {
        skipped++
        continue
      }

      // Skip if no email
      if (!parent.parent1_email) {
        errors.push(`Parent ${parent.id} (${parent.parent1_first_name} ${parent.parent1_last_name}) has no email`)
        continue
      }

      try {
        // Create Stripe customer
        const customer = await stripe.customers.create({
          email: parent.parent1_email,
          name: `${parent.parent1_first_name} ${parent.parent1_last_name}`,
          metadata: {
            parent_id: parent.id.toString(),
            parent_db_id: parent.id.toString(),
          },
        })

        // Update parent record with customer ID
        const { error: updateError } = await supabaseClient
          .from("parents")
          .update({ stripe_customer_id: customer.id })
          .eq("id", parent.id)

        if (updateError) {
          errors.push(`Failed to update parent ${parent.id}: ${updateError.message}`)
        } else {
          created++
        }
      } catch (error: any) {
        errors.push(`Failed to create customer for parent ${parent.id} (${parent.parent1_email}): ${error.message}`)
      }
    }

    return new Response(
      JSON.stringify({
        message: `Created ${created} Stripe customer(s), skipped ${skipped} that already had customers`,
        created,
        skipped,
        total: parents.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error("Error creating Stripe customers:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

