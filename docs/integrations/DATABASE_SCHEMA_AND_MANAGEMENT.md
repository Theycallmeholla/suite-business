# Database Schema and Management

**Created**: June 26, 2025, 10:15 AM CST
**Last Updated**: June 26, 2025, 10:15 AM CST

## 1. Overview

Sitebango utilizes Prisma as its Object-Relational Mapper (ORM) to interact with the database. This provides a type-safe and efficient way to manage data. The application supports both PostgreSQL (recommended for production environments) and SQLite (ideal for local development and testing).

## 2. Database Schema (`prisma/schema.prisma`)

The core of the database structure is defined in `prisma/schema.prisma`. This file defines the data models, their fields, relationships, and any database-specific configurations.

### Key Models:

-   **`User`**: Represents a user of the Sitebango platform. Contains authentication details and links to `TeamMember`.
-   **`Team`**: Represents an organizational unit, either an `agency` (your SaaS company) or a `client` (a business). This model is central to the multi-tenant architecture.
    -   `type`: Enum (`Agency`, `Client`) to distinguish between agency and client teams.
-   **`TeamMember`**: A join table that links `User` to `Team` and defines the user's role within that team.
    -   `role`: Enum (`Owner`, `Admin`, `Member`) defining permissions within the team.
-   **`Site`**: Represents a client's website or business. Each site belongs to a `Team` (client team) and contains site-specific data.
    -   `subdomain`: Used for dynamic routing and multi-tenant isolation.
    -   `ghlLocationId`: Links the site to its corresponding GoHighLevel sub-account.
-   **Other Models**: The schema includes various other models for managing business data, content, integrations, and more. Refer to `prisma/schema.prisma` for the complete and up-to-date list.

### Relationships:

Prisma defines relationships between models explicitly. For example, a `Team` can have multiple `TeamMember`s, and a `Site` belongs to a `Team`.

## 3. Multi-Tenant Data Isolation

The platform is designed with a multi-tenant architecture to ensure data isolation between different clients. This is primarily achieved through:

-   **`Team` Model**: Each client business is associated with a `Team` of type `Client`. All data related to a specific client (e.g., `Site` data, user-generated content) is linked to their respective `Client` `Team`.
-   **Subdomain Routing**: Client-facing sites are accessed via unique subdomains (e.g., `client1.localhost:3000`). The `middleware.ts` and `/app/s/[subdomain]` routes ensure that requests are routed to the correct client's data based on the subdomain.
-   **Query Filtering**: All database queries that retrieve client-specific data *must* include a filter based on the `Team` ID or `subdomain` to ensure that users only access data relevant to their authorized team.

## 4. Database Commands

Sitebango uses `npm` scripts to wrap common Prisma commands for ease of use:

-   **`npm run db:generate`**: Generates the Prisma client based on `prisma/schema.prisma`. This command should be run whenever you make changes to the schema file to ensure your application's type definitions are up-to-date.
-   **`npm run db:push`**: Pushes the current Prisma schema state to the database. This is useful for rapid development and prototyping, as it directly applies schema changes without creating migration files. **Caution**: This command can lead to data loss in production if not used carefully.
-   **`npm run db:migrate`**: Runs database migrations. This is the recommended way to apply schema changes in production environments. Prisma Migrate creates SQL migration files that track schema evolution and allow for controlled, versioned database updates.
    -   To create a new migration: `npx prisma migrate dev --name <migration_name>`
    -   To apply pending migrations: `npm run db:migrate`
-   **`npm run db:studio`**: Opens Prisma Studio, a graphical user interface (GUI) for viewing and editing your database data. This is an invaluable tool for development and debugging.

### Docker Database Commands:

For local development, Sitebango uses Docker Compose to manage PostgreSQL and Redis containers:

-   **`npm run docker:up`**: Starts the Docker containers for PostgreSQL and Redis.
-   **`npm run docker:down`**: Stops the Docker containers.
-   **`npm run docker:reset`**: Resets the Docker containers and volumes, effectively giving you a clean database instance. **Caution**: This will delete all data in your local Docker database.

## 5. Environment Configuration

The database connection is configured via the `DATABASE_URL` environment variable in your `.env.local` file.

Example for PostgreSQL (local Docker):

```
DATABASE_URL="postgresql://user:password@localhost:5432/sitebango?schema=public"
```

Example for SQLite (local development):

```
DATABASE_URL="file:./prisma/dev.db"
```

## 6. Important Considerations

-   **Migrations vs. `db:push`**: Always prefer `npm run db:migrate` for production deployments to ensure controlled and reversible schema changes. Use `npm run db:push` only for development and when data loss is acceptable.
-   **Data Seeding**: For initial setup or testing, you might need to seed your database with default data. This can be done using Prisma's seeding capabilities or custom scripts.
-   **Backup Strategy**: Implement a robust backup strategy for your production PostgreSQL database to prevent data loss.
-   **Performance**: Optimize Prisma queries using `select`, `include`, and `where` clauses to retrieve only necessary data and improve application performance.
-   **Connection Pooling**: In production, ensure proper database connection pooling is configured to manage database connections efficiently.
