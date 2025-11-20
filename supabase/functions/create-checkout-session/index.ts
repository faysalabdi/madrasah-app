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
    const { numberOfChildren = 1, parentEmail, parentName, metadata } = await req.json()

    if (!parentEmail) {
      return new Response(
        JSON.stringify({ error: "Parent email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Find or create parent in database
    let { data: parent } = await supabaseClient
      .from("parents")
      .select("*")
      .eq("parent1_email", parentEmail)
      .single()

    // Calculate total: $280 per child
    const amountPerChild = 28000 // in cents
    const totalAmount = amountPerChild * numberOfChildren

    // Create or retrieve Stripe customer
    let customer
    if (parent?.stripe_customer_id) {
      customer = await stripe.customers.retrieve(parent.stripe_customer_id)
    } else {
      const existingCustomers = await stripe.customers.list({
        email: parentEmail,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
      } else {
        customer = await stripe.customers.create({
          email: parentEmail,
          name: parentName,
          metadata: metadata || {},
        })
      }

      // Update or create parent record with Stripe customer ID
      if (parent) {
        await supabaseClient
          .from("parents")
          .update({ stripe_customer_id: customer.id })
          .eq("id", parent.id)
      } else {
        const nameParts = parentName?.split(" ") || []
        const firstName = nameParts[0] || ""
        const lastName = nameParts.slice(1).join(" ") || ""
        
        const { data: newParent } = await supabaseClient
          .from("parents")
          .insert({
            parent1_email: parentEmail,
            parent1_first_name: firstName,
            parent1_last_name: lastName,
            parent1_mobile: "", // Will be updated later
            stripe_customer_id: customer.id,
          })
          .select()
          .single()
        parent = newParent
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: `Madrasah Enrollment - ${numberOfChildren} ${numberOfChildren === 1 ? "Child" : "Children"}`,
              description: `Term fees and books for ${numberOfChildren} ${numberOfChildren === 1 ? "child" : "children"}`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${Deno.env.get("FRONTEND_URL") || "http://localhost:5000"}/admission?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get("FRONTEND_URL") || "http://localhost:5000"}/admission?canceled=true`,
      metadata: {
        parent_id: parent?.id?.toString() || "",
        numberOfChildren: numberOfChildren.toString(),
        parentEmail,
        ...metadata,
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    )
  }
})

