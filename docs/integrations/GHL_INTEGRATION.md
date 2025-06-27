# GoHighLevel (GHL) Integration Guide

**Created**: June 26, 2025, 10:05 AM CST
**Last Updated**: June 26, 2025, 10:05 AM CST

## 1. Overview

Sitebango integrates deeply with GoHighLevel (GHL) to automate various business processes, including sub-account creation, snapshot deployment, CRM operations, and user synchronization. This integration is crucial for providing a seamless experience for clients, especially those leveraging GHL's SaaS Mode.

## 2. Key Integration Points and Functionality

The GHL integration is primarily managed through the `/lib/ghl.ts` module and its related utilities. Key functionalities include:

-   **Automated Sub-Account Creation**: When a new business is created in Sitebango, a corresponding GHL sub-account is automatically provisioned via GHL's SaaS Mode. This sub-account is linked to the Sitebango business via the `ghlLocationId` in the Site model.
-   **Snapshot Deployment**: Industry-specific setups are deployed to the newly created GHL sub-accounts using GHL snapshots. This ensures that each client's GHL environment is pre-configured with relevant campaigns, funnels, and settings for their industry.
-   **Sub-Account Deletion**: When a site is removed from Sitebango, there is an option to automatically delete the associated GHL sub-account, ensuring proper cleanup and resource management.
-   **CRM Operations**: Sitebango interacts with GHL for various CRM functionalities, including managing contacts, opportunities, and appointments. This is handled through modules like `/lib/ghl-crm.ts`.
-   **Webhook Handling**: The integration supports handling webhooks from GHL to ensure real-time updates and synchronization of data between the two platforms.
-   **User Synchronization**: Users created in Sitebango are automatically synced to GHL. This ensures that all app users exist within the GHL ecosystem. The `ghl-user-sync.ts` module is responsible for this.

## 3. Sync Strategy

Sitebango employs a specific synchronization strategy with GoHighLevel:

-   **App → GHL**: ALWAYS. All users and relevant business data created or updated within the Sitebango application are pushed to GoHighLevel. This ensures that GHL always has the most up-to-date information from Sitebango.
-   **GHL → App**: OPTIONAL. Not all users or data within GHL necessarily need to be synchronized back to Sitebango. This is typically managed on a case-by-case basis depending on the specific feature or data requirement.

## 4. Environment Configuration

To enable and configure the GoHighLevel integration, the following environment variables must be set in your `.env.local` file:

-   `GHL_API_KEY`: Your main GoHighLevel API key.
-   `GHL_LOCATION_ID`: The location ID of your agency account in GoHighLevel.
-   `GHL_AGENCY_ID`: Your agency account ID in GoHighLevel.
-   `GHL_PRIVATE_INTEGRATIONS_KEY`: The private integration key for your GHL account, used for SaaS Mode operations.

Additionally, industry-specific snapshot IDs are required for automated snapshot deployment:

-   `GHL_SNAPSHOT_ID_LANDSCAPING`
-   `GHL_SNAPSHOT_ID_HVAC`
-   `GHL_SNAPSHOT_ID_PLUMBING`
-   *(and so on for other supported industries)*

Example `.env.local` configuration:

```
GHL_API_KEY="your_ghl_api_key"
GHL_LOCATION_ID="your_ghl_location_id"
GHL_AGENCY_ID="your_ghl_agency_id"
GHL_PRIVATE_INTEGRATIONS_KEY="your_ghl_private_integrations_key"

GHL_SNAPSHOT_ID_LANDSCAPING="snapshot_id_for_landscaping"
GHL_SNAPSHOT_ID_HVAC="snapshot_id_for_hvac"
GHL_SNAPSHOT_ID_PLUMBING="snapshot_id_for_plumbing"
```

## 5. Key Components and Files

-   **`/lib/ghl.ts`**: The primary module for interacting with the GoHighLevel API.
-   **`/lib/ghl-crm.ts`**: Handles CRM-related operations with GHL (contacts, opportunities, appointments).
-   **`/lib/ghl-user-sync.ts`**: Manages the synchronization of users from Sitebango to GHL.
-   **`/app/api/ghl/...`**: API routes for GoHighLevel integration endpoints.
-   **`Site` model (Prisma)**: Contains the `ghlLocationId` field to link Sitebango businesses to GHL sub-accounts.

## 6. Usage and Extension

### Creating a New Business with GHL Sub-Account:
When a new business is created through the onboarding flow, the system automatically triggers the GHL sub-account creation and snapshot deployment process. This is abstracted away from the user.

### Managing Team Members:
Sitebango provides scripts to manage team members, which also handle synchronization with GHL:

-   **Single Member**: `npm run add-agency-member email@gmail.com "Full Name" role` (creates user, adds to team, and syncs to GHL).
-   **Bulk Import**: `npm run add-agency-members-bulk`

### Extending GHL Functionality:
Developers can extend the GHL integration by:

-   Adding new functions to `/lib/ghl.ts` to support additional GHL API endpoints or features.
-   Implementing new webhook handlers to process specific events from GHL.
-   Enhancing the CRM synchronization logic in `/lib/ghl-crm.ts`.
-   Updating the `Site` model in `prisma/schema.prisma` if new GHL-related data needs to be stored.

## 7. Troubleshooting

-   **Missing Environment Variables**: Ensure all required `GHL_*` environment variables are correctly set in `.env.local`. Incorrect or missing variables will prevent the integration from functioning.
-   **API Key Issues**: Verify that the `GHL_API_KEY` is valid and has the necessary permissions within your GoHighLevel account.
-   **Snapshot ID Mismatch**: If snapshot deployment fails, double-check that the `GHL_SNAPSHOT_ID_*` variables correspond to valid snapshot IDs in your GHL agency account.
-   **Network Connectivity**: Ensure that the Sitebango application can reach the GoHighLevel API endpoints. Check firewall rules or network configurations if issues persist.
-   **GHL Logs**: Utilize GoHighLevel's internal logs and API request history to diagnose issues related to API calls originating from Sitebango.
