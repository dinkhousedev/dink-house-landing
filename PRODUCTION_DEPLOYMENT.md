# Production Deployment Guide

## Overview

This guide explains the staging-to-production deployment workflow with automatic console.log removal and production optimizations.

## Branch Strategy

- **staging**: Testing environment with all features ready for production
- **production**: Live production environment with optimized builds

## Automatic Console Removal

The `next.config.js` is configured to automatically remove `console.log` statements in production builds while keeping `console.error` and `console.warn` for debugging.

This happens automatically when `NODE_ENV=production` is set during the build process.

## Deployment Workflow

### 1. Update Staging with Production Config

**First time only**: Merge production config changes back to staging so both branches have the console removal configuration.

```bash
# From production branch
git checkout production
git pull origin production

# Merge to staging
git checkout staging
git merge production --no-ff -m "Merge production config (console removal) to staging"
git push origin staging
```

### 2. Develop and Test on Staging

```bash
# Work on staging branch
git checkout staging

# Develop features, test thoroughly
npm run dev

# Test production build locally (with console removal)
npm run build:staging
npm run start

# Verify console.log statements are removed in browser DevTools
```

### 3. Create PR from Staging to Production

When ready to deploy to production:

1. **Create Pull Request**:
   - Go to GitHub repository
   - Create PR: `staging` → `production`
   - Title: "Production Deploy: [Feature/Fix Description]"
   - Review all changes carefully

2. **Verify Changes**:
   - Check that no sensitive data or test code is included
   - Ensure `.env.production` values are updated on hosting platform
   - Review that all console.log debugging is acceptable to be removed

3. **Merge PR**:
   - Approve and merge the PR
   - Use "Merge commit" (not squash) to preserve commit history

### 4. Deploy to Production

After merging to production branch:

```bash
# Pull latest production
git checkout production
git pull origin production

# Build for production (console.log automatically removed)
npm run build:production

# Deploy to hosting platform (Vercel/Netlify/etc)
# Or if using manual deployment:
npm run start
```

## Environment Variables

### Staging (.env.local)

Use `.env.local` for staging with test/dev credentials:
- Test Stripe keys (pk_test_...)
- Dev database
- Staging API URLs

### Production (.env.production)

Use `.env.production` or platform environment variables for production with live credentials:
- Live Stripe keys (pk_live_...)
- Production database
- Production API URLs

**IMPORTANT**: Never commit `.env.production` with actual secrets. Use your hosting platform's environment variable system (Vercel Environment Variables, Netlify Environment Variables, etc.)

## What Gets Removed in Production

When `NODE_ENV=production`:
- ✅ All `console.log()` statements removed
- ✅ All `console.info()` statements removed
- ✅ All `console.debug()` statements removed
- ❌ `console.error()` kept (for error tracking)
- ❌ `console.warn()` kept (for warning tracking)

## Build Scripts

- `npm run dev` - Development server (all console statements work)
- `npm run build` - Standard build
- `npm run build:staging` - Production build for staging testing
- `npm run build:production` - Production build for deployment
- `npm run start` - Start production server

## Verifying Console Removal

1. Build for production: `npm run build:production`
2. Start server: `npm run start`
3. Open browser DevTools Console
4. Navigate through your app
5. Verify no `console.log` output appears (only errors/warnings if any)

## Quick Reference Commands

```bash
# Update staging from production (sync config)
git checkout staging
git merge production

# Create production build locally
npm run build:production

# Test production build
npm run start

# Deploy via Vercel (example)
vercel --prod

# Deploy via Netlify (example)
netlify deploy --prod
```

## Troubleshooting

### Console logs still appearing in production

1. Check `NODE_ENV` is set to `production`:
   ```bash
   echo $NODE_ENV
   ```

2. Verify `next.config.js` has the compiler.removeConsole config

3. Clear build cache:
   ```bash
   rm -rf .next
   npm run build:production
   ```

### Build differences between staging and production

Both should use the same `next.config.js`. The only difference should be environment variables (.env files).

## Best Practices

1. **Always test staging builds locally** before creating PR to production
2. **Use environment variables** for all configuration (never hardcode)
3. **Review PR carefully** - production deploys should be deliberate
4. **Keep staging and production branches in sync** with config changes
5. **Monitor production** after deployment for any console.error outputs
6. **Tag production releases** for easy rollback:
   ```bash
   git tag -a v1.0.0 -m "Production release v1.0.0"
   git push origin v1.0.0
   ```
