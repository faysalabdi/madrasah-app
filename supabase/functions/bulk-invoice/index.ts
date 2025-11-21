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
    const { daysUntilDue = 30, sendEmails = true, parentIds } = await req.json().catch(() => ({}))

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
      apiVersion: "2024-12-18.acacia",
    })

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Get term fee product and price
    const productsResponse = await stripe.products.list({
      active: true,
      limit: 100,
    })

    const termFeeProduct = productsResponse.data.find(
      (p) => p.metadata?.term_fee === "true" || p.name.toLowerCase().includes("term fee")
    )

    if (!termFeeProduct) {
      return new Response(
        JSON.stringify({ error: "Term fee product not found in Stripe" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const pricesResponse = await stripe.prices.list({
      product: termFeeProduct.id,
      active: true,
    })

    if (!pricesResponse.data || pricesResponse.data.length === 0) {
      return new Response(
        JSON.stringify({ error: "Term fee price not found in Stripe" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const termFeePrice = pricesResponse.data[0]

    // Get parents with Stripe customer IDs (either all or specific ones)
    let parentsQuery = supabaseClient
      .from("parents")
      .select("id, parent1_first_name, parent1_last_name, parent1_email, stripe_customer_id")
      .not("stripe_customer_id", "is", null)

    // If specific parent IDs provided, filter to those
    if (parentIds && Array.isArray(parentIds) && parentIds.length > 0) {
      parentsQuery = parentsQuery.in("id", parentIds.map((id: any) => parseInt(id)))
    }

    const { data: parents, error: parentsError } = await parentsQuery

    if (parentsError || !parents || parents.length === 0) {
      return new Response(
        JSON.stringify({ error: "No parents with Stripe customer IDs found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const results = {
      success: [] as Array<{ parentId: number; parentName: string; invoiceId: string }>,
      failed: [] as Array<{ parentId: number; parentName: string; error: string }>,
    }

    // Create invoices for each parent
    for (const parent of parents) {
      try {
        // Get all students for this parent
        const { data: students, error: studentsError } = await supabaseClient
          .from("students")
          .select("id, first_name, last_name")
          .eq("parent_id", parent.id)

        if (studentsError || !students || students.length === 0) {
          results.failed.push({
            parentId: parent.id,
            parentName: `${parent.parent1_first_name} ${parent.parent1_last_name}`,
            error: "No students found",
          })
          continue
        }

        // Create invoice items (one per student)
        const invoiceItems = []
        for (const student of students) {
          invoiceItems.push({
            price: termFeePrice.id,
            quantity: 1,
            description: `Term Fees for ${student.first_name} ${student.last_name}`,
          })
        }

        // Create invoice
        const invoice = await stripe.invoices.create({
          customer: parent.stripe_customer_id!,
          collection_method: "charge_automatically",
          days_until_due: daysUntilDue,
          auto_advance: true, // Automatically finalize and attempt payment
          metadata: {
            parent_id: parent.id.toString(),
            payment_type: "term_fees",
            student_ids: students.map((s) => s.id.toString()).join(","),
            number_of_students: students.length.toString(),
            student_names: students.map((s) => `${s.first_name} ${s.last_name}`).join(", "),
            paid_term_fees: "true",
            paid_for_books: "false",
            bulk_invoice: "true",
          },
        })

        // Add line items to invoice
        for (const item of invoiceItems) {
          await stripe.invoiceItems.create({
            customer: parent.stripe_customer_id!,
            invoice: invoice.id,
            price: item.price,
            quantity: item.quantity,
            description: item.description,
          })
        }

        // Finalize the invoice (this will attempt to charge if auto_advance is true)
        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)

        // Send invoice email if requested
        if (sendEmails && finalizedInvoice.status === "open") {
          await stripe.invoices.sendInvoice(finalizedInvoice.id)
        }

        results.success.push({
          parentId: parent.id,
          parentName: `${parent.parent1_first_name} ${parent.parent1_last_name}`,
          invoiceId: finalizedInvoice.id,
        })
      } catch (error: any) {
        console.error(`Error creating invoice for parent ${parent.id}:`, error)
        results.failed.push({
          parentId: parent.id,
          parentName: `${parent.parent1_first_name} ${parent.parent1_last_name}`,
          error: error.message || "Unknown error",
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: parents.length,
        succeeded: results.success.length,
        failed: results.failed.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error("Error in bulk invoice:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

