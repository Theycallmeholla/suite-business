# Google OAuth Setup for Suite Business

## Overview
We use Google OAuth for:
1. User authentication (Gmail accounts only)
2. Access to Google Business Profile API
3. Future: Calendar, Drive, etc.

## Setup Steps

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "Suite Business Production"
3. Enable APIs:
   - Google+ API (for OAuth)
   - Google My Business API
   - Google Business Profile API

### 2. Configure OAuth Consent Screen
1. Go to APIs & Services > OAuth consent screen
2. Choose "External" user type
3. Fill in:
   - App name: Suite Business
   - User support email: your-email@gmail.com
   - App domain: yourdomain.com
   - Developer contact: your-email@gmail.com
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/business.manage`
5. Add test users (for development)

### 3. Create OAuth 2.0 Credentials
1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: Web application
4. Name: Suite Business Web
5. Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://yourdomain.com
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```
7. Copy Client ID and Client Secret

### 4. Update Environment Variables
```env
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret"
```

### 5. Generate NextAuth Secret
```bash
openssl rand -base64 32
```

Add to .env:
```env
NEXTAUTH_SECRET="your-generated-secret"
```

## Testing

1. Visit http://localhost:3000/auth/signup
2. Click "Sign up with Google"
3. Select a Gmail account
4. Grant permissions
5. Should redirect to /onboarding

## Production Checklist

- [ ] Move from test mode to production in OAuth consent screen
- [ ] Add production domain to authorized origins/redirects
- [ ] Update NEXTAUTH_URL to production URL
- [ ] Use environment-specific Google Cloud projects

## Troubleshooting

### "Access Denied" error
- Check user is using Gmail account
- Verify scopes are correct
- Check OAuth consent screen is configured

### "Redirect URI mismatch"
- Ensure callback URL matches exactly
- Check for trailing slashes
- Verify protocol (http vs https)

### Token expiration
- We store refresh_token to handle this
- Tokens auto-refresh on API calls
