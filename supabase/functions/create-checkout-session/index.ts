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
    const {
      numberOfChildren = 1,
      parentEmail,
      parentName,
      formData,
      products = [], // Array of { priceId, productId, name, price }
      useTrial = false,
    } = await req.json()

    // Get email from formData if parentEmail not provided
    const email = parentEmail || formData?.parent1Email

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Parent email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ error: "Please select at least one product" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Calculate total from products (prices are in dollars, convert to cents)
    const totalAmountCents = Math.round(
      products.reduce((sum: number, p: any) => sum + p.price, 0) * numberOfChildren * 100
    )
    const productNames = products.map((p: any) => p.name).join(", ")

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Find or create parent in database
    let { data: parent, error: parentQueryError } = await supabaseClient
      .from("parents")
      .select("id, stripe_customer_id")
      .eq("parent1_email", email)
      .maybeSingle()

    if (parentQueryError) {
      console.error("Error querying parent:", parentQueryError)
    }

    let parentId: number | null = parent?.id || null

    // If parent doesn't exist, create it with form data
    if (!parent && formData) {
      const { data: newParent, error: createError } = await supabaseClient
        .from("parents")
        .insert({
          parent1_email: formData.parent1Email || email,
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
        .select("id")
        .single()

      if (createError) {
        console.error("Error creating parent:", createError)
        throw createError
      }

      parentId = newParent?.id || null
      parent = newParent
      console.log(`Created new parent with ID: ${parentId}`)
    } else if (!parent) {
      // Fallback: create minimal parent if no formData
      const nameParts = (parentName || "").split(" ") || []
      const { data: newParent, error: createError } = await supabaseClient
        .from("parents")
        .insert({
          parent1_email: email,
          parent1_first_name: nameParts[0] || "",
          parent1_last_name: nameParts.slice(1).join(" ") || "",
        })
        .select("id")
        .single()

      if (createError) {
        console.error("Error creating minimal parent:", createError)
        throw createError
      }

      parentId = newParent?.id || null
      parent = newParent
      console.log(`Created minimal parent with ID: ${parentId}`)
    }

    // Get or create Stripe customer
    let customer
    if (parent?.stripe_customer_id) {
      customer = await stripe.customers.retrieve(parent.stripe_customer_id)
    } else {
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
      } else {
        customer = await stripe.customers.create({
          email: email,
          name: parentName || `${formData?.parent1FirstName || ""} ${formData?.parent1LastName || ""}`.trim(),
        })
      }

      // Update parent with customer ID
      if (customer.id && parentId) {
        await supabaseClient
          .from("parents")
          .update({ stripe_customer_id: customer.id })
          .eq("id", parentId)
      }
    }

    // IMPORTANT: Save/update form data BEFORE creating checkout session (synchronously)
    if (formData && parentId) {
      try {
        // Update parent with full form data
        const { error: parentError } = await supabaseClient
          .from("parents")
          .update({
            parent1_email: formData.parent1Email || email,
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

        if (parentError) {
          console.error("Error updating parent:", parentError)
          throw parentError
        }

        console.log(`Parent ${parentId} updated successfully with form data`)

        // Create/update students
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

            const { data: existing, error: findError } = await supabaseClient
              .from("students")
              .select("id")
              .eq("parent_id", parentId)
              .eq("first_name", studentData.first_name)
              .eq("last_name", studentData.last_name)
              .maybeSingle()

            if (findError) {
              console.error("Error finding student:", findError)
            }

            if (existing) {
              const { error: updateError } = await supabaseClient
                .from("students")
                .update(studentData)
                .eq("id", existing.id)
              if (updateError) {
                console.error(`Error updating student ${existing.id}:`, updateError)
              } else {
                console.log(`Student ${existing.id} updated successfully`)
              }
            } else {
              const { error: insertError } = await supabaseClient
                .from("students")
                .insert(studentData)
              if (insertError) {
                console.error("Error inserting student:", insertError)
              } else {
                console.log(`Student created successfully for parent ${parentId}`)
              }
            }
          }
        }
      } catch (error) {
        console.error("Error saving form data:", error)
        // Don't fail the entire request, but log the error
        throw error // Actually throw to see the error
      }
    } else if (!parentId) {
      console.error("Cannot save form data: parentId is null")
    } else if (!formData) {
      console.error("Cannot save form data: formData is missing")
    }

    const frontendUrl = Deno.env.get("FRONTEND_URL") || "http://localhost:5000"

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
          parentEmail: email.substring(0, 100),
          useTrial: "true",
          trialEndDate: trialEndDate,
          totalAmount: totalAmountCents.toString(),
          products: JSON.stringify(products),
        },
        setup_intent_data: {
          metadata: {
            parent_id: parentId?.toString() || "",
            numberOfChildren: numberOfChildren.toString(),
            totalAmount: totalAmountCents.toString(),
            products: JSON.stringify(products),
            trialEndDate: trialEndDate,
          },
        },
      })

      // Store trial information in database
      if (parentId && trialEndDate) {
        await supabaseClient
          .from("payments")
          .insert({
            parent_id: parentId,
            amount: totalAmountCents / 100, // Convert cents to dollars
            currency: "aud",
            status: "trial",
            payment_type: "trial",
            metadata: {
              trialEndDate: trialEndDate,
              numberOfChildren: numberOfChildren,
              products: products,
              sessionId: session.id,
            },
          })
      }
    } else {
      // Immediate payment: Create checkout session with Stripe price IDs
      // Build line items from products (multiply by numberOfChildren)
      const lineItems = products.map((product: any) => ({
        price: product.priceId,
        quantity: numberOfChildren,
      }))

      session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${frontendUrl}/admission?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/admission?canceled=true`,
        metadata: {
          parent_id: parentId?.toString() || "",
          numberOfChildren: numberOfChildren.toString(),
          parentEmail: email.substring(0, 100),
          useTrial: "false",
          products: JSON.stringify(products),
        },
      })
    }

    // Return URL immediately for fast redirect
    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url,
        parentId: parentId, // Return parentId for debugging
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return new Response(
      JSON.stringify({ error: error.message, details: error.toString() }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    )
  }
})
