# AWS Amplify Environment Variables Configuration

Configure these environment variables in the **AWS Amplify Console** under:
**App Settings > Environment Variables**

## Required Production Environment Variables

### Build Configuration
```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Database Configuration
```
DB_HOST=dink-house-aws-prod-db.xxxxx.us-east-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=dink_house
DB_USER=postgres
DB_PASSWORD=<YOUR_SECURE_PRODUCTION_PASSWORD>
DB_SSL=true
```

### Payment Processing (Stripe)
```
STRIPE_SECRET_KEY=<YOUR_STRIPE_LIVE_SECRET_KEY>
STRIPE_WEBHOOK_SECRET=<YOUR_STRIPE_WEBHOOK_SECRET>
```
> **Note:** Use your actual Stripe live keys (starting with `sk_live_...` and `whsec_...`)

### Email Configuration
```
CONTACT_EMAIL=admin@dinkhousepb.com
FROM_EMAIL=hello@dinkhousepb.com
```

### Application URLs
```
SITE_URL=https://app.dinkhouse.com
```

### Rate Limiting
```
RATE_LIMIT_PER_MINUTE=10
RATE_LIMIT_PER_HOUR=100
```

## Setup Instructions

### Step 1: Access Amplify Console
1. Log in to AWS Console
2. Navigate to AWS Amplify
3. Select your app
4. Go to **App Settings** > **Environment Variables**

### Step 2: Add Each Variable
For each variable above:
1. Click **Add variable**
2. Enter the **Variable name** (e.g., `NODE_ENV`)
3. Enter the **Value**
4. Click **Save**

### Step 3: Verify Configuration
After adding all variables:
1. Click **Actions** > **Redeploy this version**
2. Monitor the build logs to ensure all environment variables are loaded
3. Check the build output for confirmation messages

## Security Best Practices

### DO:
- ✅ Use `sk_live_` Stripe keys for production (not `sk_test_`)
- ✅ Use strong database passwords (32+ characters, mixed case, numbers, symbols)
- ✅ Enable `DB_SSL=true` for encrypted database connections
- ✅ Set `NODE_ENV=production` to enable all production optimizations
- ✅ Use production RDS endpoint (not dev/staging)
- ✅ Verify all URLs use HTTPS

### DON'T:
- ❌ Never commit these values to git
- ❌ Never use development/test credentials in production
- ❌ Never disable SSL for database connections
- ❌ Never expose API keys in client-side code
- ❌ Never use weak or default passwords

## Production Optimizations Enabled

When `NODE_ENV=production` is set, the following optimizations are automatically enabled:

### Next.js Compiler (next.config.js)
- **Console Removal**: All `console.log()` statements are stripped (keeps `console.error` and `console.warn`)
- **SWC Minification**: All JavaScript is minified with the super-fast SWC compiler
- **React Production Mode**: React DevTools disabled, development warnings removed
- **Tree Shaking**: Unused code is automatically removed
- **Image Optimization**: Images are optimized and served in modern formats

### Build Process (amplify.yml)
- **Clean Install**: Uses `npm ci` for deterministic builds
- **Artifact Verification**: Validates build output before deployment
- **Cache Optimization**: Caches dependencies and build artifacts
- **Console Detection**: Scans built files to ensure no debug statements remain
- **Development Cleanup**: Removes webpack cache and dev artifacts

### Security Headers (next.config.js)
- **Powered-by Header**: Disabled to hide Next.js fingerprint
- **ESLint**: Configured to not block builds

## Troubleshooting

### Build fails with "Environment variable not found"
- Verify all required variables are set in Amplify Console
- Check for typos in variable names (case-sensitive)
- Ensure no extra spaces in variable values

### Console logs still appear in production
- Verify `NODE_ENV=production` is set in Amplify Console
- Check `next.config.js` has `compiler.removeConsole` configured
- Review build logs for warnings

### Database connection fails
- Verify `DB_HOST` is the production RDS endpoint
- Ensure `DB_SSL=true` is set
- Check security group allows connections from Amplify
- Verify database password is correct

### Stripe payments fail
- Ensure using `sk_live_` keys (not `sk_test_`)
- Verify webhook secret matches Stripe dashboard
- Check Stripe account is fully activated

## Validation Checklist

Before going live, verify:

- [ ] `NODE_ENV=production` is set
- [ ] All database credentials point to production RDS
- [ ] Stripe keys are `sk_live_` (not test keys)
- [ ] `DB_SSL=true` is enabled
- [ ] Email addresses are correct
- [ ] `SITE_URL` matches your production domain
- [ ] Rate limits are appropriate for production traffic
- [ ] No development/debug variables are present
- [ ] Build completes without warnings
- [ ] Application functions correctly after deployment

## Support

For issues with:
- **Amplify Build**: Check build logs in Amplify Console
- **Environment Variables**: AWS Amplify documentation
- **Database Connection**: Verify RDS security groups and VPC settings
- **Stripe Integration**: Stripe dashboard > Developers > Webhooks

## Related Files

- [`amplify.yml`](./amplify.yml) - Build configuration
- [`next.config.js`](./next.config.js) - Next.js production settings
- [`.env.production`](../dink-house-db-aws/.env.production) - Environment variable reference (backend)
