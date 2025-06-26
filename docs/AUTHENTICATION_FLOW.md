# Authentication Flow Documentation

## Overview
SuiteBusiness uses a unified authentication system for both agency team members and client users. This document explains how the authentication flow works and the different user types.

## User Types

### 1. Agency Team Members
- **Super Admin (Owner)**: Defined by `SUPER_ADMIN_EMAIL` environment variable
  - Full system access
  - Can manage all sites, billing, and settings
  - Automatically added to agency team as "owner" on first sign-in
  
- **Admin**: Agency team member with admin role
  - Can manage sites and view financials
  - Can invite new team members
  - Cannot change billing or delete agency
  
- **Member**: Agency team member with member role
  - Read-only access to agency dashboard
  - Can view sites and reports
  - Cannot make changes

### 2. Client Users
- Regular users who create and manage their own business sites
- Can have multiple sites under their account
- Access only their own sites and data
- Can add multiple Google accounts for GBP access

## Authentication Methods

### 1. Email/Password Authentication
- Traditional email and password sign-in
- Passwords are hashed using bcrypt
- Available for all user types

### 2. Google OAuth
- Sign in with Google account
- Required for Google Business Profile integration
- Users can link multiple Google accounts to their profile
- Automatically requests GBP permissions during OAuth flow

## Sign-In/Sign-Out Flow

### Sign-In Process
1. User visits `/signin`
2. Can choose email/password or Google OAuth
3. After successful authentication:
   - If user has sites → redirected to `/dashboard`
   - If no sites → redirected to `/onboarding`
   - Admin users can access `/admin` dashboard

### Sign-Out Process
1. User clicks sign-out button (uses `SignOutButton` component)
2. NextAuth clears the database session
3. User is redirected to `/signin`
4. CSRF protection is handled automatically by NextAuth

## Single Login System
Yes, there is **one unified login system** for everyone:
- Agency team members and clients use the same sign-in page
- User type is determined by team membership, not login method
- Access control is handled at the route level using middleware

### Benefits
- Simpler user experience
- Single authentication codebase to maintain
- Easy to upgrade clients to agency members if needed

### Considerations for Work Emails
When you implement work email authentication:
- Users can have multiple authentication methods linked
- Same email can be used for both Google OAuth and email/password
- Consider implementing email verification for work emails
- May want to restrict certain domains to agency-only access

## Access Control

### Route Protection
- `/admin/*` routes require agency team membership
- `/dashboard/*` routes require authentication
- Client sites (`/s/[subdomain]`) are public
- API routes check permissions based on user context

### Middleware
- Handles subdomain routing
- Doesn't interfere with authentication routes
- Blocks admin access from subdomains/custom domains

## Session Management
- Uses database sessions (not JWT)
- Sessions include user sites and agency role
- Session data is enriched in the `session` callback
- Sessions persist across browser restarts

## Security Features
- CSRF protection built into NextAuth
- Secure session cookies
- OAuth state validation
- Password hashing with bcrypt
- Automatic HTTPS redirect in production

## Future Enhancements
1. **Email Verification**: Add email verification for new signups
2. **2FA Support**: Add two-factor authentication
3. **SSO Integration**: Support for enterprise SSO providers
4. **Role-Based Permissions**: More granular permission system
5. **Audit Logging**: Track authentication events