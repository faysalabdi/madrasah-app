import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-12-18.acacia",
  httpClient: Stripe.createFetchHttpClient(),
})

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""

serve(async (req) => {
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return new Response("No signature", { status: 400 })
  }

  const body = await req.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  )

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const parentId = session.metadata?.parent_id

        if (parentId && session.payment_status === "paid") {
          // Create payment record
          await supabaseClient.from("payments").insert({
            parent_id: parseInt(parentId),
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || "aud",
            payment_type: "full_payment",
            status: "succeeded",
            paid_for_books: true,
            paid_term_fees: true,
            metadata: session.metadata,
          })
        }
        break
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        // Update payment status if needed
        await supabaseClient
          .from("payments")
          .update({ status: "succeeded" })
          .eq("stripe_payment_intent_id", paymentIntent.id)
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
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
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

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})

