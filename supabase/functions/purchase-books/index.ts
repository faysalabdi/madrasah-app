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
    const { parentId, studentIds, parentEmail, bookProducts } = await req.json()

    if (!parentId || !parentEmail || !bookProducts || bookProducts.length === 0) {
      return new Response(
        JSON.stringify({ error: "parentId, parentEmail, and bookProducts are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "studentIds array is required and must contain at least one student ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
      apiVersion: "2024-12-18.acacia",
    })

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Get parent data
    const { data: parent, error: parentError } = await supabaseClient
      .from("parents")
      .select("*")
      .eq("id", parentId)
      .single()

    if (parentError || !parent) {
      return new Response(
        JSON.stringify({ error: "Parent not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Build line items from book products
    const lineItems = bookProducts.map((book: { priceId: string; quantity?: number }) => ({
      price: book.priceId,
      quantity: book.quantity || 1,
    }))

    // Create or get Stripe customer
    let customerId = parent.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: parentEmail,
        name: `${parent.parent1_first_name} ${parent.parent1_last_name}`,
        metadata: {
          parent_id: parent.id.toString(),
          parent_db_id: parent.id.toString(),
        },
      })
      customerId = customer.id

      // Update parent record with customer ID
      await supabaseClient
        .from("parents")
        .update({ stripe_customer_id: customerId })
        .eq("id", parentId)
    }

    const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:5173"

    // Create checkout session
    // Pass student IDs as comma-separated string in metadata for webhook to process
    const studentIdsStr = studentIds.join(",")
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${frontendUrl}/parent-portal?payment=success`,
      cancel_url: `${frontendUrl}/parent-portal?payment=canceled`,
      metadata: {
        parent_id: parentId.toString(),
        payment_type: "books",
        student_ids: studentIdsStr, // Comma-separated list of student IDs
        paid_for_books: "true",
        paid_term_fees: "false",
      },
      payment_intent_data: {
        metadata: {
          parent_id: parentId.toString(),
          payment_type: "books",
          student_ids: studentIdsStr,
          paid_for_books: "true",
          paid_term_fees: "false",
        },
        receipt_email: parentEmail,
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error("Error creating book purchase:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

