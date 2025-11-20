# Deploy Supabase Edge Functions

The "Not Found" error means the Edge Functions haven't been deployed yet. Follow these steps:

## 1. Install Supabase CLI

```bash
npm install -g supabase
```

## 2. Login to Supabase

```bash
supabase login
```

## 3. Link Your Project

```bash
supabase link --project-ref nwouazzqxkyndyxgsxuu
```

## 4. Deploy the Functions

Make sure you're in the project root directory, then:

```bash
# Deploy checkout session function
supabase functions deploy create-checkout-session

# Deploy portal session function  
supabase functions deploy create-portal-session

# Deploy webhook handler
supabase functions deploy stripe-webhook
```

## 5. Set Environment Secrets

You need to set the secrets for your Edge Functions:

```bash
# Get your Stripe secret key from: https://dashboard.stripe.com/apikeys
supabase secrets set STRIPE_SECRET_KEY=sk_test_...

# Get your webhook secret from Stripe Dashboard → Webhooks → Your endpoint → Signing secret
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Set your frontend URL
supabase secrets set FRONTEND_URL=http://localhost:5000

# Set Supabase service role key (get from Supabase Dashboard → Settings → API)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 6. Configure Stripe Webhook

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter endpoint URL: `https://nwouazzqxkyndyxgsxuu.supabase.co/functions/v1/stripe-webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the "Signing secret" and add it to your secrets (step 5)

## 7. Test

After deploying, try the checkout flow again. The functions should now be accessible.

## Troubleshooting

- **Still getting 404?** Make sure the function names match exactly: `create-checkout-session`, `create-portal-session`, `stripe-webhook`
- **Getting 500 errors?** Check the function logs: `supabase functions logs create-checkout-session`
- **CORS errors?** The functions already include CORS headers, but make sure your `VITE_SUPABASE_URL` is correct

