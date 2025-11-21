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

    // Get all parents who have a Stripe customer ID
    const { data: parents, error: parentsError } = await supabaseClient
      .from("parents")
      .select("id, parent1_first_name, parent1_last_name, parent1_email, stripe_customer_id")
      .not("stripe_customer_id", "is", null)

    if (parentsError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch parents", details: parentsError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (!parents || parents.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No parents with Stripe customer IDs found",
          valid: 0,
          invalid: 0,
          recreated: 0,
          total: 0
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    let valid = 0
    let invalid = 0
    let recreated = 0
    const errors: string[] = []
    const invalidCustomerIds: string[] = []

    // Check each parent's Stripe customer ID
    for (const parent of parents) {
      if (!parent.stripe_customer_id) continue

      try {
        // Try to retrieve the customer from Stripe
        const customer = await stripe.customers.retrieve(parent.stripe_customer_id)

        // Check if customer was deleted (Stripe returns a deleted customer object)
        if (customer.deleted) {
          // Customer was deleted in Stripe
          invalid++
          invalidCustomerIds.push(parent.stripe_customer_id)

          // Clear the customer ID from database
          const { error: updateError } = await supabaseClient
            .from("parents")
            .update({ stripe_customer_id: null })
            .eq("id", parent.id)

          if (updateError) {
            errors.push(`Failed to clear invalid customer ID for parent ${parent.id}: ${updateError.message}`)
          }

          // Optionally recreate the customer if they have an email
          if (parent.parent1_email) {
            try {
              const newCustomer = await stripe.customers.create({
                email: parent.parent1_email,
                name: `${parent.parent1_first_name} ${parent.parent1_last_name}`,
                metadata: {
                  parent_id: parent.id.toString(),
                  parent_db_id: parent.id.toString(),
                },
              })

              // Update parent with new customer ID
              const { error: recreateError } = await supabaseClient
                .from("parents")
                .update({ stripe_customer_id: newCustomer.id })
                .eq("id", parent.id)

              if (recreateError) {
                errors.push(`Failed to update parent ${parent.id} with new customer ID: ${recreateError.message}`)
              } else {
                recreated++
              }
            } catch (recreateErr: any) {
              errors.push(`Failed to recreate customer for parent ${parent.id}: ${recreateErr.message}`)
            }
          }
        } else {
          // Customer exists and is valid
          valid++
        }
      } catch (error: any) {
        // Customer doesn't exist (404 or other error)
        if (error.code === 'resource_missing' || error.statusCode === 404) {
          invalid++
          invalidCustomerIds.push(parent.stripe_customer_id)

          // Clear the customer ID from database
          const { error: updateError } = await supabaseClient
            .from("parents")
            .update({ stripe_customer_id: null })
            .eq("id", parent.id)

          if (updateError) {
            errors.push(`Failed to clear invalid customer ID for parent ${parent.id}: ${updateError.message}`)
          }

          // Optionally recreate the customer if they have an email
          if (parent.parent1_email) {
            try {
              const newCustomer = await stripe.customers.create({
                email: parent.parent1_email,
                name: `${parent.parent1_first_name} ${parent.parent1_last_name}`,
                metadata: {
                  parent_id: parent.id.toString(),
                  parent_db_id: parent.id.toString(),
                },
              })

              // Update parent with new customer ID
              const { error: recreateError } = await supabaseClient
                .from("parents")
                .update({ stripe_customer_id: newCustomer.id })
                .eq("id", parent.id)

              if (recreateError) {
                errors.push(`Failed to update parent ${parent.id} with new customer ID: ${recreateError.message}`)
              } else {
                recreated++
              }
            } catch (recreateErr: any) {
              errors.push(`Failed to recreate customer for parent ${parent.id}: ${recreateErr.message}`)
            }
          }
        } else {
          errors.push(`Error checking customer ${parent.stripe_customer_id} for parent ${parent.id}: ${error.message}`)
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: `Synced ${parents.length} parent(s): ${valid} valid, ${invalid} invalid (cleared), ${recreated} recreated`,
        valid,
        invalid,
        recreated,
        total: parents.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error("Error syncing Stripe customers:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

