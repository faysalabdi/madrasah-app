import Stripe from "https://esm.sh/stripe@14?target=denonext"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2024-12-18.acacia",
})

// This is needed in order to use the Web Crypto API in Deno.
const cryptoProvider = Stripe.createSubtleCryptoProvider()

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") as string

Deno.serve(async (request) => {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "stripe-signature",
      },
    })
  }

  const signature = request.headers.get("Stripe-Signature") || request.headers.get("stripe-signature")

  if (!signature) {
    return new Response("No signature", { status: 400 })
  }

  // First step is to verify the event. The .text() method must be used as the
  // verification relies on the raw request body rather than the parsed JSON.
  const body = await request.text()
  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err)
    return new Response(
      JSON.stringify({ error: `Webhook Error: ${err.message}` }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    )
  }

  console.log(`🔔 Event received: ${event.id} (${event.type})`)

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  )

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const parentId = session.metadata?.parent_id

        if (!parentId) break

        if (session.mode === "setup" && session.metadata?.useTrial === "true") {
          // Trial setup: Update existing trial payment record with setup intent info
          const setupIntentId = session.setup_intent as string
          const trialEndDate = session.metadata?.trialEndDate

          // Get the setup intent to get payment method
          const setupIntent = await stripe.setupIntents.retrieve(setupIntentId)
          const paymentMethodId = setupIntent.payment_method as string

          // Update the trial payment record
          await supabaseClient
            .from("payments")
            .update({
              stripe_setup_intent_id: setupIntentId,
              stripe_payment_method_id: paymentMethodId,
              status: "trial_active",
              trial_end_date: trialEndDate || null,
            })
            .eq("stripe_checkout_session_id", session.id)
        } else if (session.payment_status === "paid" && session.payment_intent) {
          // Immediate payment: Create payment record(s)
          const paymentType = session.metadata?.payment_type || "full_payment"
          const studentIdStr = session.metadata?.student_id
          const studentIdsStr = session.metadata?.student_ids // Comma-separated list
          const paidForBooks = session.metadata?.paid_for_books === "true"
          const paidTermFees = session.metadata?.paid_term_fees === "true"
          const termId = session.metadata?.term_id ? parseInt(session.metadata.term_id) : null
          
          // If paying for term fees and we have student_ids, create separate payment records for each student
          if (paidTermFees && studentIdsStr && !paidForBooks) {
            // Term fees only - create one record per student
            const studentIds = studentIdsStr.split(",").filter(Boolean).map(id => parseInt(id.trim()))
            const amountPerStudent = (session.amount_total || 0) / 100 / studentIds.length
            
            // Create one payment record per student
            for (const sid of studentIds) {
              await supabaseClient.from("payments").insert({
                parent_id: parseInt(parentId),
                student_id: sid,
                stripe_checkout_session_id: session.id,
                stripe_payment_intent_id: session.payment_intent as string,
                amount: amountPerStudent,
                currency: session.currency || "aud",
                payment_type: paymentType,
                status: "succeeded",
                paid_for_books: false,
                paid_term_fees: true,
                term_id: termId,
                metadata: { ...session.metadata, student_id: sid.toString() },
              })
            }
          } else if (paidTermFees && studentIdsStr && paidForBooks) {
            // Full payment (term fees + books) - create one record per student for term fees, plus one for books
            const studentIds = studentIdsStr.split(",").filter(Boolean).map(id => parseInt(id.trim()))
            
            // Calculate amounts (assuming term fees are per student, books are total)
            // For now, split total amount equally per student
            const amountPerStudent = (session.amount_total || 0) / 100 / studentIds.length
            
            // Create payment records: one per student with both term fees and books
            for (const sid of studentIds) {
              await supabaseClient.from("payments").insert({
                parent_id: parseInt(parentId),
                student_id: sid,
                stripe_checkout_session_id: session.id,
                stripe_payment_intent_id: session.payment_intent as string,
                amount: amountPerStudent,
                currency: session.currency || "aud",
                payment_type: paymentType,
                status: "succeeded",
                paid_for_books: true,
                paid_term_fees: true,
                term_id: termId,
                metadata: { ...session.metadata, student_id: sid.toString() },
              })
            }
          } else if (paidForBooks && studentIdsStr && !paidTermFees) {
            // Books only with multiple students - create one record per student
            const studentIds = studentIdsStr.split(",").filter(Boolean).map(id => parseInt(id.trim()))
            // Calculate book amount per student (total books cost divided by number of students)
            const amountPerStudent = (session.amount_total || 0) / 100 / studentIds.length
            
            // Create one payment record per student for books
            for (const sid of studentIds) {
              await supabaseClient.from("payments").insert({
                parent_id: parseInt(parentId),
                student_id: sid,
                stripe_checkout_session_id: session.id,
                stripe_payment_intent_id: session.payment_intent as string,
                amount: amountPerStudent,
                currency: session.currency || "aud",
                payment_type: paymentType,
                status: "succeeded",
                paid_for_books: true,
                paid_term_fees: false,
                term_id: termId,
                metadata: { ...session.metadata, student_id: sid.toString() },
              })
            }
          } else {
            // Single payment record (books only, or single student term fees)
            const studentId = studentIdStr ? parseInt(studentIdStr) : null
            
            await supabaseClient.from("payments").insert({
              parent_id: parseInt(parentId),
              student_id: studentId,
              stripe_checkout_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent as string,
              amount: (session.amount_total || 0) / 100,
              currency: session.currency || "aud",
              payment_type: paymentType,
              status: "succeeded",
              paid_for_books: paidForBooks,
              paid_term_fees: paidTermFees,
              term_id: termId,
              metadata: session.metadata,
            })
          }
        }
        break
      }

      case "setup_intent.succeeded": {
        const setupIntent = event.data.object as Stripe.SetupIntent
        const parentId = setupIntent.metadata?.parent_id

        if (parentId && setupIntent.payment_method) {
          // Update trial payment record with setup intent and payment method
          await supabaseClient
            .from("payments")
            .update({
              stripe_setup_intent_id: setupIntent.id,
              stripe_payment_method_id: setupIntent.payment_method as string,
              status: "trial_active",
            })
            .eq("parent_id", parseInt(parentId))
            .eq("status", "trial")
        }
        break
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Check if payment record exists
        const { data: existingPayment } = await supabaseClient
          .from("payments")
          .select("id")
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .maybeSingle()

        if (existingPayment) {
          // Update existing payment
          await supabaseClient
            .from("payments")
            .update({ status: "succeeded" })
            .eq("stripe_payment_intent_id", paymentIntent.id)
        } else {
          // Create new payment record if it doesn't exist (fallback)
          // Find parent by customer ID
          const customerId = paymentIntent.customer as string
          const { data: parent } = await supabaseClient
            .from("parents")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle()

          if (parent) {
            const paymentType = paymentIntent.metadata?.payment_type || "full_payment"
            const studentId = paymentIntent.metadata?.student_id ? parseInt(paymentIntent.metadata.student_id) : null
            const paidForBooks = paymentIntent.metadata?.paid_for_books === "true"
            const paidTermFees = paymentIntent.metadata?.paid_term_fees === "true"
            const termId = paymentIntent.metadata?.term_id ? parseInt(paymentIntent.metadata.term_id) : null
            
            await supabaseClient.from("payments").insert({
              parent_id: parent.id,
              student_id: studentId,
              stripe_payment_intent_id: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
              payment_type: paymentType,
              status: "succeeded",
              paid_for_books: paidForBooks,
              paid_term_fees: paidTermFees,
              term_id: termId,
              metadata: paymentIntent.metadata,
            })
          }
        }
        break
      }

      case "charge.refunded":
      case "refund.created": {
        // Handle refunds - update payment status to refunded
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent as string

        if (paymentIntentId) {
          // Update payment status to refunded
          await supabaseClient
            .from("payments")
            .update({ 
              status: "refunded",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_payment_intent_id", paymentIntentId)
          
          console.log(`Payment refunded: ${paymentIntentId}`)
        }
        break
      }

      case "payment_intent.canceled":
      case "payment_intent.payment_failed": {
        // Handle payment cancellations and failures
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        if (paymentIntent.id) {
          // Update payment status
          const newStatus = event.type === "payment_intent.canceled" ? "canceled" : "failed"
          
          await supabaseClient
            .from("payments")
            .update({ 
              status: newStatus,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_payment_intent_id", paymentIntent.id)
          
          console.log(`Payment ${newStatus}: ${paymentIntent.id}`)
        }
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const parentId = subscription.metadata?.parent_id

        if (parentId) {
          const subscriptionData = {
            parent_id: parseInt(parentId),
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status,
            current_period_start: new Date(
              subscription.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            metadata: subscription.metadata,
          }

          if (event.type === "customer.subscription.deleted") {
            await supabaseClient
              .from("subscriptions")
              .update({ status: "canceled" })
              .eq("stripe_subscription_id", subscription.id)
          } else {
            await supabaseClient
              .from("subscriptions")
              .upsert(subscriptionData, {
                onConflict: "stripe_subscription_id",
              })
          }
        }
        break
      }

      case "invoice.payment_succeeded": {
        // Handle successful subscription renewal payments
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId && invoice.payment_intent) {
          // Get subscription to find parent and student info
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const parentId = subscription.metadata?.parent_id

          if (parentId) {
            const { data: parent } = await supabaseClient
              .from("parents")
              .select("id")
              .eq("id", parseInt(parentId))
              .maybeSingle()

            if (parent) {
              const studentIdsStr = subscription.metadata?.student_ids
              const paidTermFees = subscription.metadata?.paid_term_fees === "true"
              const paidForBooks = subscription.metadata?.paid_for_books === "true"
              const termId = subscription.metadata?.term_id ? parseInt(subscription.metadata.term_id) : null

              // If we have student IDs, create payment records for each student
              if (studentIdsStr && paidTermFees) {
                const studentIds = studentIdsStr.split(",").filter(Boolean).map(id => parseInt(id.trim()))
                const amountPerStudent = (invoice.amount_paid || 0) / 100 / studentIds.length

                for (const sid of studentIds) {
                  await supabaseClient.from("payments").insert({
                    parent_id: parent.id,
                    student_id: sid,
                    stripe_payment_intent_id: invoice.payment_intent as string,
                    stripe_subscription_id: subscriptionId,
                    stripe_invoice_id: invoice.id,
                    amount: amountPerStudent,
                    currency: invoice.currency,
                    payment_type: "term_fees",
                    status: "succeeded",
                    paid_for_books: paidForBooks,
                    paid_term_fees: paidTermFees,
                    term_id: termId,
                    metadata: subscription.metadata,
                  })
                }
              } else {
                // Single payment record if no student IDs specified
                await supabaseClient.from("payments").insert({
                  parent_id: parent.id,
                  student_id: null,
                  stripe_payment_intent_id: invoice.payment_intent as string,
                  stripe_subscription_id: subscriptionId,
                  stripe_invoice_id: invoice.id,
                  amount: (invoice.amount_paid || 0) / 100,
                  currency: invoice.currency,
                  payment_type: "term_fees",
                  status: "succeeded",
                  paid_for_books: paidForBooks,
                  paid_term_fees: paidTermFees,
                  term_id: termId,
                  metadata: subscription.metadata,
                })
              }
            }
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error: any) {
    console.error("Webhook handler error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
