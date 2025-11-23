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
    const { 
      daysUntilDue = 30, 
      sendEmails = true, 
      parentIds,
      invoiceTermFees = true,
      invoiceBooks = false,
      invoiceAllStudents = true,
      studentSelections = {} // { parentId: [studentId1, studentId2, ...] }
    } = await req.json().catch(() => ({}))

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

    // Try multiple ways to find the term fee product
    const termFeeProduct = productsResponse.data.find(
      (p) => 
        p.metadata?.term_fee === "true" || 
        p.name.toLowerCase().includes("term fee") ||
        p.name.toLowerCase().includes("term fees") ||
        p.name.toLowerCase().includes("termfee")
    )

    if (!termFeeProduct) {
      const productNames = productsResponse.data.map(p => p.name).join(", ")
      return new Response(
        JSON.stringify({ 
          error: `Term fee product not found in Stripe. Available products: ${productNames || "none"}`,
          availableProducts: productsResponse.data.map(p => ({ id: p.id, name: p.name }))
        }),
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

    // For invoices, we need a one-time price, not recurring
    // Try to find a one-time price first
    let termFeePrice = pricesResponse.data.find((p) => p.type === "one_time")
    
    // If no one-time price exists, use the first price but we'll need to handle it differently
    if (!termFeePrice) {
      // Check if we have a recurring price - we'll need to extract the amount and create invoice items manually
      const recurringPrice = pricesResponse.data.find((p) => p.type === "recurring")
      if (recurringPrice) {
        // We'll use the recurring price's unit_amount to create invoice items
        termFeePrice = recurringPrice as any
      } else {
        termFeePrice = pricesResponse.data[0]
      }
    }

    // Get book products if books are being invoiced
    let bookProducts: Stripe.Product[] = []
    let bookPrices: Stripe.Price[] = []
    if (invoiceBooks) {
      bookProducts = productsResponse.data.filter(
        (p) => p.metadata?.book === "true" || p.name.toLowerCase().includes("book")
      )
      
      if (bookProducts.length > 0) {
        for (const bookProduct of bookProducts) {
          const bookPricesResponse = await stripe.prices.list({
            product: bookProduct.id,
            active: true,
          })
          if (bookPricesResponse.data && bookPricesResponse.data.length > 0) {
            bookPrices.push(...bookPricesResponse.data)
          }
        }
      }
    }

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
        // Get students for this parent - either all or selected ones
        let studentsQuery = supabaseClient
          .from("students")
          .select("id, first_name, last_name")
          .eq("parent_id", parent.id)

        // If not invoicing all students, filter to selected ones
        if (!invoiceAllStudents && studentSelections && studentSelections[parent.id]) {
          const selectedStudentIds = studentSelections[parent.id]
          if (selectedStudentIds && selectedStudentIds.length > 0) {
            studentsQuery = studentsQuery.in("id", selectedStudentIds.map((id: any) => parseInt(id)))
          } else {
            // Skip this parent if no students selected
            continue
          }
        }

        const { data: students, error: studentsError } = await studentsQuery

        if (studentsError || !students || students.length === 0) {
          results.failed.push({
            parentId: parent.id,
            parentName: `${parent.parent1_first_name} ${parent.parent1_last_name}`,
            error: "No students found or selected",
          })
          continue
        }

        // Determine payment type for metadata
        let paymentType = "term_fees"
        if (invoiceTermFees && invoiceBooks) {
          paymentType = "full_payment"
        } else if (invoiceBooks) {
          paymentType = "books"
        }

        // Create invoice
        // Use "send_invoice" if days_until_due > 0, otherwise "charge_automatically"
        const collectionMethod = daysUntilDue > 0 ? "send_invoice" : "charge_automatically"
        const invoiceData: any = {
          customer: parent.stripe_customer_id!,
          collection_method: collectionMethod,
          auto_advance: true, // Automatically finalize and attempt payment
          metadata: {
            parent_id: parent.id.toString(),
            payment_type: paymentType,
            student_ids: students.map((s) => s.id.toString()).join(","),
            number_of_students: students.length.toString(),
            student_names: students.map((s) => `${s.first_name} ${s.last_name}`).join(", "),
            paid_term_fees: invoiceTermFees ? "true" : "false",
            paid_for_books: invoiceBooks ? "true" : "false",
            bulk_invoice: "true",
          },
        }
        
        // Only add days_until_due if using send_invoice method
        if (collectionMethod === "send_invoice" && daysUntilDue > 0) {
          invoiceData.days_until_due = daysUntilDue
        }
        
        const invoice = await stripe.invoices.create(invoiceData)

        // Add line items to invoice
        // Term Fees
        if (invoiceTermFees) {
          // If price is recurring, we need to use amount directly instead of price ID
          if (termFeePrice.type === "recurring") {
            // Use the recurring price's unit_amount to create invoice items
            const unitAmount = (termFeePrice as any).unit_amount || 0
            for (const student of students) {
              await stripe.invoiceItems.create({
                customer: parent.stripe_customer_id!,
                invoice: invoice.id,
                amount: unitAmount,
                currency: (termFeePrice as any).currency || "aud",
                description: `Term Fees for ${student.first_name} ${student.last_name}`,
              })
            }
          } else {
            // Use price ID for one-time prices
            for (const student of students) {
              await stripe.invoiceItems.create({
                customer: parent.stripe_customer_id!,
                invoice: invoice.id,
                price: termFeePrice.id,
                quantity: 1,
                description: `Term Fees for ${student.first_name} ${student.last_name}`,
              })
            }
          }
        }

        // Books
        if (invoiceBooks && bookPrices.length > 0) {
          // Add all book prices to the invoice
          for (const bookPrice of bookPrices) {
            if (bookPrice.type === "recurring") {
              const unitAmount = (bookPrice as any).unit_amount || 0
              await stripe.invoiceItems.create({
                customer: parent.stripe_customer_id!,
                invoice: invoice.id,
                amount: unitAmount,
                currency: (bookPrice as any).currency || "aud",
                description: `Books - ${bookPrice.nickname || "Book"}`,
              })
            } else {
              await stripe.invoiceItems.create({
                customer: parent.stripe_customer_id!,
                invoice: invoice.id,
                price: bookPrice.id,
                quantity: 1,
                description: `Books - ${bookPrice.nickname || "Book"}`,
              })
            }
          }
        }

        // Finalize the invoice (this will attempt to charge if auto_advance is true)
        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)

        // Always send invoice email
        if (finalizedInvoice.status === "open" || finalizedInvoice.status === "paid") {
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

