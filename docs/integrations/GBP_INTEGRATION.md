# Google Business Profile (GBP) Integration Guide

**Created**: June 26, 2025, 10:10 AM CST
**Last Updated**: June 26, 2025, 10:10 AM CST

## 1. Overview

Sitebango integrates with Google Business Profile (GBP) to facilitate business onboarding, data enrichment, and verification. This integration allows users to leverage their existing GBP listings to quickly set up their websites, import business information, and verify ownership. The integration also utilizes the Google Places API for real-time business search and detailed place information retrieval.

## 2. Key Integration Points and Functionality

The GBP integration is primarily handled through the `/lib/google-business-profile.ts` module and the `/app/api/gbp` API routes. Key functionalities include:

-   **OAuth2-based Authentication**: Users sign in with their Google accounts to grant Sitebango access to their GBP data. This is managed through NextAuth.js and Google OAuth providers.
-   **Profile Fetching and Management**: Sitebango can fetch and display connected Google accounts and their associated GBP locations. This includes checking the status of accounts (e.g., suspended, no GBP access).
-   **Multi-Account Support**: The system supports users connecting multiple Google accounts, allowing them to switch between accounts to manage different GBP listings.
-   **Google Places API Integration**: 
    -   **Real-time Business Search**: The `/api/gbp/search` endpoint uses the Google Places API to allow users to search for businesses in real-time, leveraging intelligent caching (`/lib/gbp-cache.ts`) to optimize API calls and costs.
    -   **Detailed Place Information**: The `/api/gbp/place-details` endpoint retrieves comprehensive business information (address, phone, hours, reviews, photos) from the Places API.
    -   **Cost Optimization**: Field masking is used to retrieve only necessary data, minimizing API costs. The system also optimizes usage to stay within the $200/month free tier.
-   **Ownership Verification**: The `/api/gbp/check-ownership` endpoint helps verify if a user has ownership of a specific GBP listing, which is crucial for claiming and managing businesses within Sitebango.
-   **Business Claim Dialog**: The `/components/BusinessClaimDialog.tsx` component handles the UI flow for ownership verification and claiming a business.

## 3. Data Flow

1.  **User Authentication**: User signs in with Google via NextAuth.js.
2.  **Account Listing**: Sitebango fetches a list of connected Google accounts and their GBP status.
3.  **Business Search**: User searches for their business using the `/api/gbp/search` endpoint, which queries the Google Places API.
4.  **Place Details Retrieval**: Once a business is selected, `/api/gbp/place-details` fetches detailed information.
5.  **Ownership Check**: The system verifies if the user owns the selected GBP listing via `/api/gbp/check-ownership`.
6.  **Data Import**: If ownership is confirmed, relevant GBP data is imported into Sitebango to pre-populate business information during onboarding.

## 4. Environment Configuration

To enable and configure the Google Business Profile integration, the following environment variables must be set in your `.env.local` file:

-   `GOOGLE_CLIENT_ID`: Your Google OAuth client ID.
-   `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret.
-   `GOOGLE_MAPS_API_KEY`: Your Google Maps/Places API key, used for business search and place details.

Example `.env.local` configuration:

```
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
```

## 5. Key Components and Files

-   **`/lib/google-business-profile.ts`**: Core logic for interacting with Google Business Profile APIs.
-   **`/lib/google-api-utils.ts`**: Utility functions for Google API interactions.
-   **`/lib/gbp-cache.ts`**: Caching mechanism for Google Places API responses.
-   **`/app/api/gbp/...`**: API routes for all GBP-related operations.
-   **`/components/AddGoogleAccountDialog.tsx`**: Component for adding new Google accounts.
-   **`/components/GoogleAccountSelector.tsx`**: Component for selecting and switching between connected Google accounts.
-   **`/components/BusinessAutocomplete.tsx`**: UI component for business search using Google Places API.
-   **`/components/BusinessClaimDialog.tsx`**: Handles the business ownership verification flow.

## 6. Usage and Extension

### Onboarding Flow:
During the onboarding process (`/app/onboarding`), users are guided through connecting their Google account and searching for their business. The system intelligently uses GBP data to pre-fill forms and streamline the setup.

### Extending GBP Functionality:
Developers can extend the GBP integration by:

-   Adding new functions to `/lib/google-business-profile.ts` to support additional GBP API features (e.g., managing reviews, posts).
-   Enhancing the caching strategy in `/lib/gbp-cache.ts` for further cost optimization.
-   Developing new UI components that leverage GBP data for display or interaction.
-   Updating the `Site` or `Business` models in `prisma/schema.prisma` to store more GBP-related information.

## 7. Troubleshooting

-   **Missing Environment Variables**: Ensure all `GOOGLE_*` environment variables are correctly set in `.env.local`. Incorrect or missing variables will prevent the integration from functioning.
-   **OAuth Consent Screen**: Verify that your Google Cloud Project's OAuth consent screen is properly configured and published. Issues here can prevent users from authenticating.
-   **API Key Restrictions**: If you experience issues with Google Places API, check that your `GOOGLE_MAPS_API_KEY` has the necessary API restrictions enabled in the Google Cloud Console (e.g., Places API, Geocoding API).
-   **Quota Limits**: Monitor your Google Cloud Project's API usage to ensure you are not exceeding daily quotas. Implement exponential backoff for retries if you encounter rate limit errors.
-   **User Permissions**: Ensure the Google account used for authentication has the necessary permissions to access and manage the target Google Business Profile listing.
