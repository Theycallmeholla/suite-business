# Authentication and Authorization

**Created**: June 26, 2025, 10:20 AM CST
**Last Updated**: June 26, 2025, 10:20 AM CST

## 1. Overview

Sitebango implements a robust authentication and authorization system to manage user access and permissions across the platform. This system leverages NextAuth.js for secure authentication flows and a custom role-based access control (RBAC) mechanism to define user capabilities within different team contexts.

## 2. Authentication (NextAuth.js)

Sitebango uses NextAuth.js for handling user authentication. This provides a flexible and secure way to manage user sessions, sign-in/sign-out processes, and integrate with various authentication providers.

### Key Features:

-   **Google OAuth**: The primary authentication method is via Google OAuth, allowing users to sign in with their existing Google accounts. This is crucial for integrating with Google Business Profile.
-   **Session Management**: NextAuth.js handles secure session creation and management, ensuring that user sessions are protected.
-   **Callbacks**: Custom callbacks are used to extend NextAuth.js functionality, such as adding custom fields to the session object (e.g., user roles, team information) and synchronizing user data with the database.

### Relevant Files:

-   **`next.config.ts`**: Configures NextAuth.js routes and environment variables.
-   **`/lib/auth.ts`**: Contains the NextAuth.js configuration, including providers, callbacks, and database adapter setup.
-   **`/lib/auth-helpers.ts`**: Provides utility functions for authentication-related tasks, such as getting the current session or user ID.
-   **`/app/(auth)/...`**: Contains the UI components and pages related to authentication (e.g., sign-in page).

## 3. Authorization (Role-Based Access Control - RBAC)

Sitebango implements a role-based access control system to manage what actions users can perform. Permissions are defined at two main levels: Agency and Business.

### Team Structure and Roles:

As defined in the `Team` and `TeamMember` models in `prisma/schema.prisma`:

#### Agency Level (Your SaaS Company)

-   **`Owner` (Super Admin)**: Has full system access. This role is typically assigned to the user defined by the `SUPER_ADMIN_EMAIL` environment variable.
-   **`Admin`**: Can manage businesses, view financial data, and manage other team members within the agency.
-   **`Member`**: Has read-only access to businesses and reports.

#### Business Level (Your Clients)

-   Each business is owned by the user who created it. Future enhancements will include business-level teams with their own roles and permissions.

### Permission Enforcement:

Authorization checks are performed at various layers of the application:

-   **API Routes**: Before processing requests, API routes (e.g., in `/app/api/...`) verify the user's authentication status and role to ensure they have the necessary permissions to perform the requested action.
-   **Server Components/Actions**: Data fetching and mutations in server components or Next.js server actions include authorization checks.
-   **Client-Side UI**: UI elements (e.g., buttons, navigation links) are conditionally rendered or disabled based on the user's role to provide a guided user experience.

### Relevant Files:

-   **`prisma/schema.prisma`**: Defines the `Team`, `TeamMember`, and `User` models, including roles.
-   **`/lib/teams.ts`**: Contains logic for managing teams and team members, including role assignments.
-   **`/lib/api-middleware.ts`**: Custom middleware that can be used to enforce authentication and authorization on API routes.
-   **`/lib/auth-helpers.ts`**: Provides functions to check user roles and permissions.

## 4. Environment Configuration

To configure authentication and authorization, the following environment variables are required in your `.env.local` file:

-   `NEXTAUTH_SECRET`: A random string used to hash tokens, sign/encrypt cookies, and generate a cryptographic key. **Crucial for security.**
-   `NEXTAUTH_URL`: The base URL of your application (e.g., `http://localhost:3000` or `https://yourdomain.com`).
-   `GOOGLE_CLIENT_ID`: Your Google OAuth client ID (as also used for GBP integration).
-   `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret (as also used for GBP integration).
-   `SUPER_ADMIN_EMAIL`: The email address of the user who will be designated as the `Owner` (Super Admin) of the agency team upon initial setup.

Example `.env.local` configuration:

```
NEXTAUTH_SECRET="your_super_secret_string"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
SUPER_ADMIN_EMAIL="admin@yourcompany.com"
```

## 5. Usage and Extension

### Initial Agency Setup:

Upon initial deployment, the `npm run setup:agency` script can be used to create the initial agency team and assign the `SUPER_ADMIN_EMAIL` user as the `Owner`.

### Adding Team Members:

Team members can be added to the agency team using the `npm run add-agency-member` script, which also handles GHL synchronization:

```bash
npm run add-agency-member email@gmail.com "Full Name" role
```

### Extending Authorization:

-   **Granular Permissions**: For more granular control, the `permissions` JSON field in the `TeamMember` model can be extended to define specific capabilities beyond just roles.
-   **New Roles**: If new types of users or access levels are required, new roles can be defined in the `TeamMember` enum and integrated into the authorization logic.
-   **Policy-Based Access Control**: For complex authorization requirements, consider implementing a policy-based access control system that evaluates dynamic rules based on user attributes, resource attributes, and environmental conditions.

## 6. Security Considerations

-   **Protect `NEXTAUTH_SECRET`**: Never expose `NEXTAUTH_SECRET` in client-side code or commit it to version control. Use environment variables.
-   **Server-Side Authorization**: Always perform authorization checks on the server-side (API routes, server components) as client-side checks can be bypassed.
-   **Least Privilege**: Adhere to the principle of least privilege, granting users only the minimum permissions necessary to perform their tasks.
-   **Input Validation**: Validate all user inputs to prevent injection attacks and other security vulnerabilities.
-   **Rate Limiting**: Implement rate limiting on authentication endpoints to mitigate brute-force attacks.
