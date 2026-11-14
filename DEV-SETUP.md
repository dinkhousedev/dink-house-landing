# Local Development Setup Guide

Complete guide for setting up local development environment with Stripe testing.

## Prerequisites

- Node.js 18+ installed
- Stripe CLI installed (already have: `/usr/bin/stripe`)
- Supabase account with project created

## Quick Start

### 1. Install Dependencies

```bash
cd /home/ert/dink-house-all/dink-house-landing
npm install
```

### 2. Configure Environment Variables

Your `.env.local` needs these keys:

#### A. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Test mode** keys (NOT production!)
3. Add to `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxx
```

#### B. Get Supabase Service Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/wchxzbuuwssrnaxshseu/settings/api)
2. Under "Project API keys", copy the `service_role` key (NOT the anon key!)
3. Add to `.env.local`:

```bash
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```

### 3. Start the Development Server

```bash
npm run dev
```

Your app will be running at: **http://localhost:3000**

---

## Stripe Webhook Testing (Critical!)

Your webhook endpoint is at: [pages/api/stripe/webhook.ts](pages/api/stripe/webhook.ts:15)

### Option 1: Stripe CLI (Recommended for Local Development)

#### Step 1: Login to Stripe CLI

```bash
stripe login
```

This will open your browser to authenticate.

#### Step 2: Forward Webhooks to Local Server

Open a **new terminal** and run:

```bash
cd /home/ert/dink-house-all/dink-house-landing
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Important:** Keep this terminal running while testing!

#### Step 3: Copy the Webhook Signing Secret

The `stripe listen` command will output something like:

```
> Ready! Your webhook signing secret is whsec_abc123def456... (^C to quit)
```

**Copy that `whsec_...` value** and add it to your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_abc123def456...
```

#### Step 4: Restart Your Dev Server

After updating `.env.local`, restart your Next.js dev server:

```bash
# Press Ctrl+C to stop the server
npm run dev
```

#### Step 5: Test a Payment

1. Go to http://localhost:3000
2. Navigate to the contribution/checkout page
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete the checkout

You should see webhook events in the terminal running `stripe listen`:

```
2025-10-16 12:34:56   --> checkout.session.completed [evt_abc123]
2025-10-16 12:34:57   <--  [200] POST http://localhost:3000/api/stripe/webhook [evt_abc123]
```

### Option 2: ngrok (For Testing from Mobile/External Devices)

If you need to test from external devices or share your local environment:

#### Step 1: Install ngrok

```bash
# If not installed
snap install ngrok
# or
brew install ngrok  # on macOS
```

#### Step 2: Start ngrok

```bash
ngrok http 3000
```

You'll get a URL like: `https://abc123.ngrok.io`

#### Step 3: Configure Stripe Webhook

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Enter: `https://abc123.ngrok.io/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_from_stripe_dashboard
```

#### Step 4: Test

Visit your ngrok URL: `https://abc123.ngrok.io` and test a payment.

---

## Testing Webhook Events Manually

You can trigger test webhook events using the Stripe CLI:

```bash
# Test checkout session completed
stripe trigger checkout.session.completed

# Test payment intent succeeded
stripe trigger payment_intent.succeeded

# Test payment failed
stripe trigger payment_intent.payment_failed

# Test refund
stripe trigger charge.refunded
```

---

## Common Issues & Solutions

### Issue: "No signatures found matching the expected signature for payload"

**Solution:** Your `STRIPE_WEBHOOK_SECRET` is incorrect or not set.

1. Make sure you copied the webhook secret from `stripe listen` output
2. Restart your Next.js dev server after updating `.env.local`
3. Make sure you're NOT using the production webhook secret

### Issue: Webhook endpoint returns 500 error

**Solution:** Check your environment variables:

```bash
# Verify all required vars are set
echo $STRIPE_SECRET_KEY
echo $STRIPE_WEBHOOK_SECRET
echo $SUPABASE_SERVICE_KEY
```

### Issue: Database RPC function fails

**Solution:** Your `SUPABASE_SERVICE_KEY` might be wrong.

1. Go to Supabase Dashboard > Settings > API
2. Copy the `service_role` key (NOT `anon` key!)
3. Update `.env.local` and restart server

### Issue: Contributions not showing in database

**Solution:** Check your Supabase RPC functions exist:

```sql
-- Run in Supabase SQL Editor
SELECT routine_name
FROM information_schema.routines
WHERE routine_type = 'FUNCTION'
AND routine_name LIKE '%contribution%';
```

You should see:

- `complete_contribution`
- `create_checkout_contribution`
- `update_contribution_session`

---

## Development Workflow

### Daily Workflow

1. **Terminal 1:** Start Next.js dev server

   ```bash
   npm run dev
   ```

2. **Terminal 2:** Start Stripe webhook forwarding

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. **Test your changes:**
   - Visit http://localhost:3000
   - Make test contributions
   - Check webhook events in Terminal 2

### Testing Checklist

- [ ] Can create checkout session
- [ ] Can complete payment with test card `4242 4242 4242 4242`
- [ ] Webhook receives `checkout.session.completed` event
- [ ] Contribution status updated to "completed" in Supabase
- [ ] Backer benefits allocated correctly
- [ ] Thank you email queued (check Supabase `email_logs` table)
- [ ] For $1000+ contributions, court sponsor record created

---

## Stripe Test Cards

| Card Number           | Description                           |
| --------------------- | ------------------------------------- |
| `4242 4242 4242 4242` | Successful payment                    |
| `4000 0025 0000 3155` | Requires authentication (3D Secure)   |
| `4000 0000 0000 9995` | Payment declined (insufficient funds) |
| `4000 0000 0000 0002` | Payment declined (card declined)      |

All test cards:

- Use any future expiration date (e.g., `12/34`)
- Use any 3-digit CVC (e.g., `123`)
- Use any ZIP code (e.g., `12345`)

---

## Useful Commands

### Stripe CLI

```bash
# View recent events
stripe events list --limit 10

# View specific event details
stripe events retrieve evt_abc123

# Resend webhook event
stripe events resend evt_abc123

# View webhook endpoint status
stripe webhook-endpoints list
```

### View Logs

```bash
# Watch Next.js server logs
npm run dev

# Watch Stripe webhook events
stripe listen --print-json
```

---

## Port Reference

| Service                 | Port        | URL                                      |
| ----------------------- | ----------- | ---------------------------------------- |
| Next.js Dev Server      | 3000        | http://localhost:3000                    |
| Mailpit (Email Testing) | 1025 (SMTP) | http://localhost:8025 (Web UI)           |
| Supabase (Cloud)        | N/A         | https://wchxzbuuwssrnaxshseu.supabase.co |

---

## Production vs Development

### Development (localhost)

- Uses Stripe **Test mode** keys (sk*test*...)
- Webhook forwarded via Stripe CLI
- Points to cloud Supabase (wchxzbuuwssrnaxshseu.supabase.co)
- Site URL: http://localhost:3000

### Production (dinkhousepb.com)

- Uses Stripe **Live mode** keys (sk*live*...)
- Webhook configured in Stripe Dashboard
- Points to cloud Supabase (same instance or different)
- Site URL: https://dinkhousepb.com

**NEVER mix test and production keys!**

---

## Next Steps

1. [ ] Get Stripe test API keys from dashboard
2. [ ] Get Supabase service key from dashboard
3. [ ] Update `.env.local` with real values
4. [ ] Run `stripe login` to authenticate CLI
5. [ ] Start dev server: `npm run dev`
6. [ ] Start webhook forwarding: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
7. [ ] Copy webhook secret to `.env.local`
8. [ ] Restart dev server
9. [ ] Test a payment with test card
10. [ ] Verify webhook events in terminal

---

## Support

- Stripe Docs: https://stripe.com/docs/webhooks/test
- Stripe CLI Docs: https://stripe.com/docs/stripe-cli
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

## Troubleshooting Help

If you're stuck:

1. Check all environment variables are set
2. Check both terminals are running (dev server + stripe listen)
3. Check webhook secret matches between `.env.local` and `stripe listen` output
4. Check Supabase service key is correct
5. Check database has all required RPC functions
