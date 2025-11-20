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

// Product prices in cents
const PRODUCT_PRICES = {
  fiqhBook: 2000, // $20
  surahsDua: 2000, // $20
  islamicStudies: 4000, // $40
  termFees: 20000, // $200 - ALWAYS INCLUDED
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const {
      numberOfChildren = 1,
      parentEmail,
      parentName,
      formData,
      productSelection = {
        fiqhBook: true,
        surahsDua: true,
        islamicStudies: true,
        termFees: true, // Always true
      },
      useTrial = false,
    } = await req.json()

    if (!parentEmail) {
      return new Response(
        JSON.stringify({ error: "Parent email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Ensure term fees are always included
    productSelection.termFees = true

    // Calculate total based on selected products (term fees always included)
    let amountPerChild = PRODUCT_PRICES.termFees // Term fees are mandatory
    const selectedItems: string[] = ["Term Fees"]

    if (productSelection.fiqhBook) {
      amountPerChild += PRODUCT_PRICES.fiqhBook
      selectedItems.push("Fiqh Book")
    }
    if (productSelection.surahsDua) {
      amountPerChild += PRODUCT_PRICES.surahsDua
      selectedItems.push("Surahs and Dua Book")
    }
    if (productSelection.islamicStudies) {
      amountPerChild += PRODUCT_PRICES.islamicStudies
      selectedItems.push("Islamic Studies Book")
    }

    const totalAmount = amountPerChild * numberOfChildren

    if (totalAmount === 0) {
      return new Response(
        JSON.stringify({ error: "Please select at least one product" }),
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

    // FAST: Only check if parent exists (minimal query)
    let { data: parent } = await supabaseClient
      .from("parents")
      .select("id, stripe_customer_id")
      .eq("parent1_email", parentEmail)
      .single()

    let parentId: number | null = parent?.id || null

    // FAST: Create or retrieve Stripe customer (parallel operations)
    const [customerResult, parentResult] = await Promise.all([
      // Get or create Stripe customer
      (async () => {
        if (parent?.stripe_customer_id) {
          return await stripe.customers.retrieve(parent.stripe_customer_id)
        }
        
        const existingCustomers = await stripe.customers.list({
          email: parentEmail,
          limit: 1,
        })

        if (existingCustomers.data.length > 0) {
          return existingCustomers.data[0]
        }

        return await stripe.customers.create({
          email: parentEmail,
          name: parentName,
        })
      })(),
      // Create parent if doesn't exist (only if needed)
      (async () => {
        if (!parent) {
          const nameParts = parentName?.split(" ") || []
          const { data: newParent } = await supabaseClient
            .from("parents")
            .insert({
              parent1_email: parentEmail,
              parent1_first_name: nameParts[0] || "",
              parent1_last_name: nameParts.slice(1).join(" ") || "",
            })
            .select("id")
            .single()
          return newParent?.id || null
        }
        return parent.id
      })(),
    ])

    const customer = customerResult
    parentId = parentResult || parentId

    // Update parent with customer ID if needed (non-blocking)
    if (customer.id && parentId) {
      supabaseClient
        .from("parents")
        .update({ stripe_customer_id: customer.id })
        .eq("id", parentId)
        .then(() => {}) // Fire and forget - don't wait
    }

    const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:5000"
    const productDescription = selectedItems.join(", ")

    let session
    let trialEndDate: string | null = null

    if (useTrial) {
      // 14-day free trial: Use Setup Intent to save payment method
      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 14)
      trialEndDate = trialEnd.toISOString()

      // Create Setup Intent session (to save payment method)
      session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ["card"],
        mode: "setup", // Setup mode - saves payment method without charging
        success_url: `${frontendUrl}/admission?success=true&session_id={CHECKOUT_SESSION_ID}&trial=true`,
        cancel_url: `${frontendUrl}/admission?canceled=true`,
        metadata: {
          parent_id: parentId?.toString() || "",
          numberOfChildren: numberOfChildren.toString(),
          parentEmail: parentEmail.substring(0, 100),
          useTrial: "true",
          trialEndDate: trialEndDate,
          totalAmount: totalAmount.toString(),
          productSelection: JSON.stringify(productSelection),
        },
        setup_intent_data: {
          metadata: {
            parent_id: parentId?.toString() || "",
            numberOfChildren: numberOfChildren.toString(),
            totalAmount: totalAmount.toString(),
            productSelection: JSON.stringify(productSelection),
            trialEndDate: trialEndDate,
          },
        },
      })
    } else {
      // Immediate payment: Create regular checkout session
      session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "aud",
              product_data: {
                name: `Madrasah Enrollment - ${numberOfChildren} ${numberOfChildren === 1 ? "Child" : "Children"}`,
                description: productDescription,
              },
              unit_amount: totalAmount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${frontendUrl}/admission?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/admission?canceled=true`,
        metadata: {
          parent_id: parentId?.toString() || "",
          numberOfChildren: numberOfChildren.toString(),
          parentEmail: parentEmail.substring(0, 100),
          useTrial: "false",
          productSelection: JSON.stringify(productSelection),
        },
      })
    }

    // Store formData and trial info AFTER creating session (non-blocking)
    if (formData && parentId) {
      supabaseClient
        .from("parents")
        .update({
          parent1_first_name: formData.parent1FirstName || "",
          parent1_last_name: formData.parent1LastName || "",
          parent1_mobile: formData.parent1Mobile || "",
          parent1_address: formData.parent1Address || "",
          parent1_postcode: formData.parent1Postcode || "",
          parent1_relationship: formData.parent1Relationship || "",
          parent2_first_name: formData.parent2FirstName || null,
          parent2_last_name: formData.parent2LastName || null,
          parent2_mobile: formData.parent2Mobile || null,
          parent2_relationship: formData.parent2Relationship || null,
          parent2_address: formData.parent2Address || null,
          parent2_postcode: formData.parent2Postcode || null,
        })
        .eq("id", parentId)
        .then(async () => {
          // Create students after parent is updated
          if (formData.children && Array.isArray(formData.children)) {
            for (const child of formData.children) {
              const studentData = {
                parent_id: parentId,
                first_name: child.firstName || "",
                last_name: child.lastName || "",
                date_of_birth: child.dob || null,
                gender: child.gender || null,
                grade: child.yearLevel || "",
                current_school: child.currentSchool || "",
                medical_issues: child.medicalIssues === "yes" ? "yes" : "no",
                medical_details: child.medicalDetails || null,
              }

              const { data: existing } = await supabaseClient
                .from("students")
                .select("id")
                .eq("parent_id", parentId)
                .eq("first_name", studentData.first_name)
                .eq("last_name", studentData.last_name)
                .single()

              if (existing) {
                await supabaseClient
                  .from("students")
                  .update(studentData)
                  .eq("id", existing.id)
              } else {
                await supabaseClient.from("students").insert(studentData)
              }
            }
          }
        })
        .catch(console.error) // Log errors but don't block
    }

    // If trial, store trial information in database
    if (useTrial && parentId && trialEndDate) {
      supabaseClient
        .from("payments")
        .insert({
          parent_id: parentId,
          amount: totalAmount / 100, // Convert cents to dollars
          currency: "aud",
          status: "trial",
          payment_type: "trial",
          metadata: {
            trialEndDate: trialEndDate,
            numberOfChildren: numberOfChildren,
            productSelection: productSelection,
            sessionId: session.id,
          },
        })
        .then(() => {})
        .catch(console.error)
    }

    // Return URL immediately for fast redirect
    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
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
