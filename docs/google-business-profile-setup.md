# Google Business Profile API Setup Guide

This guide will help you set up Google Business Profile integration for Suite Business.

## Prerequisites

1. A Google Cloud Project
2. A Google Business Profile account
3. OAuth 2.0 credentials configured

## Step 1: Enable Required APIs

You need to enable these APIs in your Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Library**
4. Search for and enable these APIs:
   - **Google My Business Account Management API**
   - **Google My Business Business Information API**
   - **Google My Business Management API** (if available)

## Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Choose **Web application**
4. Add these settings:
   - **Name**: Suite Business (or your app name)
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
5. Click **CREATE**
6. Copy the **Client ID** and **Client Secret**

## Step 3: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

## Step 4: Set Up OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (unless you have Google Workspace)
3. Fill in the required information:
   - **App name**: Suite Business
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/business.manage`
5. Add test users if in development
6. Submit for verification if going to production

## Step 5: (Optional) Service Account for Server-Side Access

For server-side operations without user interaction:

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **Service account**
3. Fill in the details and create
4. Click on the service account > **Keys** > **Add Key** > **Create new key**
5. Choose **JSON** and download
6. Save the file as `credentials/google-service-account.json`
7. Update `.env.local`:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS="./credentials/google-service-account.json"
   ```

## Troubleshooting

### Error: "API has not been used in project"
- Make sure you've enabled all required APIs in Step 1
- Wait a few minutes after enabling for changes to propagate

### Error: "Invalid grant" or "Token expired"
- User needs to re-authenticate by signing in again
- Check that refresh tokens are being stored properly

### Error: "Access denied"
- Verify the OAuth scopes include business.manage
- Check that the user has access to a Google Business Profile

## Testing the Integration

1. Start your development server: `npm run dev`
2. Sign in with a Google account that has Google Business Profile access
3. Navigate to the onboarding page
4. The app should be able to list your business locations

## Production Considerations

1. Update redirect URIs to use your production domain
2. Submit OAuth consent screen for verification
3. Use environment-specific credentials
4. Implement proper error handling and retry logic
5. Consider rate limits and quotas