# Stripe Integration Setup Guide

## ✅ Completed Steps

1. ✅ Database schema created in Supabase (parents, students, payments, subscriptions tables)
2. ✅ Stripe checkout component created
3. ✅ Payment portal page created
4. ✅ Application form updated to pass data to Stripe checkout
5. ✅ Admission page updated to use Stripe checkout
6. ✅ Supabase Edge Functions created

## 📋 Next Steps

### 1. Install Dependencies

Make sure you have these packages installed:

```bash
npm install @stripe/stripe-js
```

### 2. Environment Variables

Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=https://nwouazzqxkyndyxgsxuu.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Deploy Supabase Edge Functions

You need to deploy the Edge Functions to Supabase. You can do this using the Supabase CLI:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref nwouazzqxkyndyxgsxuu

# Deploy the functions
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy stripe-webhook
```

### 4. Set Edge Function Secrets

Set the required secrets for your Edge Functions:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set FRONTEND_URL=http://localhost:5000
```

### 5. Configure Stripe Webhook

1. Go to your Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://nwouazzqxkyndyxgsxuu.supabase.co/functions/v1/stripe-webhook`
3. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret and add it to your Edge Function secrets

### 6. Import CSV Data (Optional)

To import existing parent/student data from the CSV file, you can use the Supabase MCP server or create a migration script.

## 🧪 Testing

1. Start your development server: `npm run dev`
2. Navigate to `/admission`
3. Fill out the application form
4. Submit the form - you should see the Stripe checkout component
5. Click "Pay" to test the checkout flow (use Stripe test card: 4242 4242 4242 4242)

## 📝 Notes

- The payment amount is calculated as $280 per child (books + term fees)
- Stripe customers are automatically created and linked to parent records
- Payment records are created in Supabase when checkout is completed
- Existing parents can access the payment portal at `/payment-portal`

