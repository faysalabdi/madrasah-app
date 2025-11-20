# Set Edge Function Secrets

The Edge Functions are now deployed, but they need environment variables (secrets) to work. 

## Set Secrets in Supabase Dashboard

1. Go to your Supabase project: https://supabase.com/dashboard/project/nwouazzqxkyndyxgsxuu
2. Navigate to **Edge Functions** → **Settings** (or go to **Project Settings** → **Edge Functions**)
3. Click on **Secrets** tab
4. Add these secrets:

### Required Secrets:

1. **STRIPE_SECRET_KEY**
   - Get from: https://dashboard.stripe.com/apikeys
   - Value: `sk_test_...` (your Stripe secret key)

2. **STRIPE_WEBHOOK_SECRET** (optional for now, needed for webhooks)
   - Get from: Stripe Dashboard → Webhooks → Your endpoint → Signing secret
   - Value: `whsec_...`

3. **FRONTEND_URL**
   - Value: `http://localhost:5000` (for local development)
   - For production: `https://yourdomain.com`

4. **SUPABASE_SERVICE_ROLE_KEY**
   - Get from: Supabase Dashboard → Settings → API → service_role key
   - ⚠️ Keep this secret! Never expose it in client-side code.

5. **SUPABASE_URL** (usually auto-set, but verify)
   - Value: `https://nwouazzqxkyndyxgsxuu.supabase.co`

## After Setting Secrets

The functions should work immediately. Try the checkout flow again!

## Test the Functions

1. Fill out the application form
2. Click "Pay" button
3. You should be redirected to Stripe checkout

If you still get errors, check the function logs in Supabase Dashboard → Edge Functions → Logs.

