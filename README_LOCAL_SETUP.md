# Running the Project on Localhost

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

1. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

2. Edit `.env` and add your actual values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://nwouazzqxkyndyxgsxuu.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Database (if using Drizzle)
DATABASE_URL=your_database_url_here

# Frontend URL (for Stripe redirects)
FRONTEND_URL=http://localhost:5000
```

**Where to find these values:**
- **Supabase URL & Anon Key**: Go to your Supabase project dashboard → Settings → API
- **Stripe Publishable Key**: Go to Stripe Dashboard → Developers → API keys
- **Database URL**: Only needed if you're using Drizzle migrations

## Step 3: Run the Development Server

```bash
npm run dev
```

This will:
- Start the Express server on port **5000**
- Start the Vite dev server (hot-reload enabled)
- Serve both the API routes and the React frontend

## Step 4: Access the Application

Open your browser and navigate to:

```
http://localhost:5000
```

## Available Routes

- `/` - Home page
- `/about` - About page
- `/programs` - Programs page
- `/admission` - Admission page (with application form and Stripe checkout)
- `/faculty` - Faculty page
- `/contact` - Contact page
- `/apply` - Google Form redirect
- `/payment-portal` - Payment portal for existing parents

## Troubleshooting

### Port 5000 is already in use

If port 5000 is already in use, you can change it in `server/index.ts`:

```typescript
const port = 5000; // Change this to another port
```

### Environment variables not loading

Make sure your `.env` file is in the root directory (same level as `package.json`).

### Stripe checkout not working

1. Make sure `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
2. Make sure your Supabase Edge Functions are deployed
3. Check browser console for errors

### Supabase connection issues

1. Verify your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
2. Check that your Supabase project is active
3. Make sure the database tables are created (run the migration if needed)

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server (after build)
- `npm run check` - Type check TypeScript files
- `npm run db:push` - Push database schema changes (if using Drizzle)

## Hot Reload

The Vite dev server supports hot module replacement (HMR), so changes to your React components will automatically refresh in the browser without a full page reload.

## Next Steps

1. **Deploy Supabase Edge Functions** (if not already done):
   ```bash
   supabase functions deploy create-checkout-session
   supabase functions deploy create-portal-session
   supabase functions deploy stripe-webhook
   ```

2. **Set Edge Function Secrets**:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   supabase secrets set FRONTEND_URL=http://localhost:5000
   ```

3. **Test the Stripe Integration**:
   - Go to `/admission`
   - Fill out the application form
   - Test the checkout flow with Stripe test card: `4242 4242 4242 4242`

