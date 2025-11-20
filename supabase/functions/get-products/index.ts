import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno"

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
    // Fetch all active products with their prices
    const products = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    })

    // Format products for frontend
    const formattedProducts = products.data.map((product) => {
      const price = product.default_price
      let priceAmount = 0
      let priceId = null

      if (typeof price === "object" && price !== null) {
        priceId = price.id
        if ("unit_amount" in price && price.unit_amount) {
          priceAmount = price.unit_amount / 100 // Convert cents to dollars
        }
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        priceId: priceId,
        price: priceAmount,
        metadata: product.metadata,
      }
    })

    return new Response(
      JSON.stringify({ products: formattedProducts }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    console.error("Error fetching products:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    )
  }
})

