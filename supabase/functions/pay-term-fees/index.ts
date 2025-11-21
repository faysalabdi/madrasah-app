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
    const { parentId, studentId, parentEmail } = await req.json()

    if (!parentId || !parentEmail) {
      return new Response(
        JSON.stringify({ error: "parentId and parentEmail are required" }),
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

    // Get students (either specific one or all)
    const studentsQuery = supabaseClient
      .from("students")
      .select("*")
      .eq("parent_id", parentId)

    if (studentId) {
      studentsQuery.eq("id", studentId)
    }

    const { data: students, error: studentsError } = await studentsQuery

    if (studentsError || !students || students.length === 0) {
      return new Response(
        JSON.stringify({ error: "No students found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Get term fee product from Stripe (look for product with metadata term_fee: true)
    const productsResponse = await stripe.products.list({
      active: true,
      limit: 100,
    })

    if (!productsResponse || !productsResponse.data) {
      console.error("Failed to fetch products from Stripe:", productsResponse)
      return new Response(
        JSON.stringify({ error: "Failed to fetch products from Stripe. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const termFeeProduct = productsResponse.data.find(
      (p) => p.metadata?.term_fee === "true" || p.name.toLowerCase().includes("term fee")
    )

    if (!termFeeProduct) {
      console.error("Term fee product not found. Available products:", productsResponse.data.map(p => ({ id: p.id, name: p.name, metadata: p.metadata })))
      return new Response(
        JSON.stringify({ error: "Term fee product not found in Stripe. Please contact support." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Get the default price for term fee product
    const pricesResponse = await stripe.prices.list({
      product: termFeeProduct.id,
      active: true,
    })

    if (!pricesResponse || !pricesResponse.data || pricesResponse.data.length === 0) {
      console.error("No prices found for term fee product:", termFeeProduct.id)
      return new Response(
        JSON.stringify({ error: "Term fee price not found in Stripe. Please contact support." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const termFeePrice = pricesResponse.data[0]

    // Determine if this is a recurring price (subscription) or one-time payment
    const isRecurring = termFeePrice.type === "recurring"

    // Calculate total: term fee per student
    const numberOfStudents = students.length
    const lineItems = []

    // Add term fee for each student
    for (let i = 0; i < numberOfStudents; i++) {
      lineItems.push({
        price: termFeePrice.id,
        quantity: 1,
      })
    }

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

    // Build description for checkout showing which student(s)
    let checkoutDescription = "Term Fees"
    if (studentId && students.length === 1) {
      checkoutDescription = `Term Fees for ${students[0].first_name} ${students[0].last_name}`
    } else if (numberOfStudents > 1) {
      const studentNames = students.map(s => `${s.first_name} ${s.last_name}`).join(", ")
      checkoutDescription = `Term Fees for ${numberOfStudents} student${numberOfStudents > 1 ? 's' : ''}: ${studentNames}`
    }

    // Create checkout session - use subscription mode if price is recurring, payment mode if one-time
    const sessionConfig: any = {
      customer: customerId,
      mode: isRecurring ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${frontendUrl}/parent-portal?payment=success`,
      cancel_url: `${frontendUrl}/parent-portal?payment=canceled`,
      metadata: {
        parent_id: parentId.toString(),
        payment_type: "term_fees",
        student_ids: students.map((s) => s.id.toString()).join(","),
        student_id: studentId ? studentId.toString() : "", // Include specific student_id if paying for one
        number_of_students: numberOfStudents.toString(),
        student_names: students.map(s => `${s.first_name} ${s.last_name}`).join(", "),
        paid_term_fees: "true",
        paid_for_books: "false",
      },
    }

    // Add subscription-specific metadata if recurring
    if (isRecurring) {
      sessionConfig.subscription_data = {
        metadata: {
          parent_id: parentId.toString(),
          payment_type: "term_fees",
          student_ids: students.map((s) => s.id.toString()).join(","),
          student_id: studentId ? studentId.toString() : "",
          number_of_students: numberOfStudents.toString(),
          student_names: students.map(s => `${s.first_name} ${s.last_name}`).join(", "),
          paid_term_fees: "true",
          paid_for_books: "false",
        },
      }
    } else {
      // For one-time payments, add payment_intent_data
      sessionConfig.payment_intent_data = {
        metadata: {
          parent_id: parentId.toString(),
          payment_type: "term_fees",
          student_id: studentId ? studentId.toString() : "",
          student_ids: students.map((s) => s.id.toString()).join(","),
          paid_term_fees: "true",
          paid_for_books: "false",
        },
        receipt_email: parentEmail,
        description: checkoutDescription,
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error("Error creating term fee payment:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

