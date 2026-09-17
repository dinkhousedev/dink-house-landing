# Google reCAPTCHA Setup Guide

This guide explains how to set up Google reCAPTCHA v2 for the contact form on The Dink House landing page.

## Prerequisites

- Google account
- Access to your environment variables (.env.local)

## Step 1: Get Your reCAPTCHA Keys

1. Go to the [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click on the "+" button to create a new site
3. Fill in the form:
   - **Label**: "Dink House Contact Form" (or any descriptive name)
   - **reCAPTCHA type**: Choose "reCAPTCHA v2" → "I'm not a robot" Checkbox
   - **Domains**: Add your domains:
     - For development: `localhost`
     - For production: `dinkhousepb.com` (and any other domains you use)
4. Accept the reCAPTCHA Terms of Service
5. Click "Submit"

## Step 2: Copy Your Keys

After creating your site, you'll see two keys:

- **Site Key**: This is public and used in your React component
- **Secret Key**: This is private and used for server-side verification

## Step 3: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Google reCAPTCHA v2 Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

Replace `your_site_key_here` and `your_secret_key_here` with your actual keys from Google.

## Step 4: Restart Your Development Server

After adding the environment variables, restart your Next.js development server:

```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

## How It Works

### Frontend (Contact Form)

- The reCAPTCHA widget appears at the bottom of the contact form
- Users must complete the challenge before submitting
- The form validates that reCAPTCHA was completed
- A token is sent with the form data to the API

### Backend (API Endpoint)

- The API endpoint receives the reCAPTCHA token
- It verifies the token with Google's servers
- Only verified submissions are processed
- Failed verifications return an error

## Testing

### Development Testing

1. Open the contact form on your local development server
2. Fill in the form fields
3. Complete the reCAPTCHA challenge
4. Submit the form
5. Verify that the submission is successful

### Without Keys (Development Only)

If you don't have reCAPTCHA keys configured in development:

- The reCAPTCHA widget won't appear
- Form submissions will still work (verification is skipped)
- A warning will appear in the console

## Production Deployment

For production deployment, ensure:

1. Your production domain is added to the reCAPTCHA site settings
2. Environment variables are set in your production environment
3. Both `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY` are configured

## Troubleshooting

### reCAPTCHA not appearing

- Check that `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set in `.env.local`
- Ensure you've restarted the development server after adding the key
- Verify the site key is correct

### "reCAPTCHA verification failed" error

- Check that `RECAPTCHA_SECRET_KEY` is set correctly
- Ensure your domain is added to the reCAPTCHA site settings
- Check the browser console for any errors

### Testing in development

- Add `localhost` to your reCAPTCHA domains in Google Admin Console
- Use the test keys provided by Google for automated testing (if needed)

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your Secret Key secure - never expose it in client-side code
- The Site Key is public and safe to expose
- Consider implementing additional rate limiting for extra protection

## Support

For issues with reCAPTCHA:

- Check [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/display)
- Review the implementation in `/components/contact-form.tsx` and `/pages/api/contact-form.ts`
