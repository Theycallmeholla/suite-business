# Team Management & Permissions

**Created**: December 23, 2024, 2:45 PM CST  
**Last Updated**: December 23, 2024, 2:45 PM CST

## Overview

Suite Business uses a team-based architecture that mirrors GoHighLevel's agency/sub-account structure. This provides proper role-based access control and seamless integration with GHL's CRM and automation features.

## Team Structure

### Agency Level (Your SaaS Company)
The platform owner's team that manages all client businesses.

**Hierarchy:**
```
Agency Team (GHL Agency)
├── Owner (Super Admin) - Full system access
├── Admins (Agency Staff) - Can manage all businesses
└── Members (Support Staff) - View-only access to businesses
```

**Environment Setup:**
```env
# Super Admin Email (agency owner)
SUPER_ADMIN_EMAIL="your-email@example.com"

# GHL Agency Credentials
GHL_AGENCY_ID="P3dnzE3rTpDhL91FNKc8"
GHL_PRIVATE_INTEGRATIONS_KEY="pit-..."
```

### Client Level (Your Customers)
Each business that signs up gets:
- Their own team (future feature)
- GHL sub-account (automatically created)
- Isolated data and permissions

```
Client Team (GHL Sub-Account)
├── Owner (Business Owner) - Full access to their sites
├── Admins (Managers) - Administrative access
└── Members (Employees) - Limited access
```

## Adding Agency Team Members

### Quick Start - Gmail Users

#### Option 1: Add Individual Members
```bash
npm run add-agency-member john@gmail.com "John Smith" admin
npm run add-agency-member jane@gmail.com "Jane Doe" member
```

#### Option 2: Bulk Import
1. Edit `scripts/add-agency-members-bulk.ts`:
```typescript
const teamMembers = [
  { email: 'john@gmail.com', name: 'John Smith', role: 'admin' },
  { email: 'jane@gmail.com', name: 'Jane Doe', role: 'member' },
  // Add all your team here...
];
```

2. Run:
```bash
npm run add-agency-members-bulk
```

### Non-Gmail Users

For team members without Gmail accounts:

```bash
# Create user with email/password
npm run create-user john@company.com "John Smith" SecurePass123! admin
npm run create-user jane@company.com "Jane Doe" AnotherPass456! member
```

They can then sign in at `/signin` with their email and password.

### What Happens When You Add Someone

1. ✅ User is created in the database (if needed)
2. ✅ Added to agency team with specified role
3. ✅ Automatically synced to GoHighLevel
4. ✅ They can immediately sign in and access the platform

## GoHighLevel Sync Strategy

### Sync Direction
- **App → GHL**: ALWAYS (All app users must exist in GHL)
- **GHL → App**: OPTIONAL (Not all GHL users need app access)

### Why This Strategy?
1. **GHL is the CRM/Automation Engine** - Every user needs to be in GHL for lead tracking, automation, and reporting
2. **Suite Business is the Website Builder** - Only some users need access for website management

### Automatic Sync Points
- User signs up → Created in GHL agency location
- User creates business → Added to that GHL sub-account
- User joins agency team → Role updated in GHL

## Roles & Permissions

### Agency Roles

| Role | Description | Capabilities |
|------|-------------|--------------|
| **Owner** | Super Admin | • Full system access<br>• Revenue analytics<br>• Platform settings<br>• User management |
| **Admin** | Agency Staff | • Access all client sites<br>• Provide support<br>• Cannot manage agency team |
| **Member** | Support Staff | • View all client sites<br>• Read-only access<br>• Cannot make changes |

### Access Control

```typescript
// Check if user is agency team member
const isAgencyMember = await isAgencyTeamMember(userId);

// Check if user can access specific site
const hasAccess = await canAccessSite(userId, siteId);

// Get all sites user can access
const sites = await getUserAccessibleSites(userId);
```

### Dashboard Routing
- **Agency Team Members** → `/admin` (Agency Dashboard)
- **Client Users** → `/dashboard` or `/dashboard/simple`

## Database Structure

```
Team (type: 'agency' or 'client')
├── TeamMember (links users to teams with roles)
│   ├── userId
│   ├── teamId
│   ├── role: 'owner' | 'admin' | 'member'
│   └── permissions: JSON (future granular permissions)
└── Site (businesses belong to teams)
    └── ghlLocationId (links to GHL sub-account)
```

## Initial Setup

### 1. Clean Start (if needed)
```bash
# Clean all existing data
npm run db:clean

# Push new schema
npm run db:push
```

### 2. Set Up Agency Team
```bash
# Creates agency team and adds super admin
npm run setup:agency
```

### 3. Add Your Team
Use the commands above to add your agency team members.

## Common Tasks

### Check User's Role
```typescript
import { getUserRole } from '@/lib/teams';

const role = await getUserRole(userId);
// Returns: 'owner' | 'admin' | 'member' | null
```

### Add User to Agency Team
```typescript
import { addToAgencyTeam } from '@/lib/teams';

await addToAgencyTeam(userId, 'admin');
```

### Create Client Team
```typescript
import { createClientTeam } from '@/lib/teams';

// When a business is created
const team = await createClientTeam(
  businessName,
  ownerId,
  ghlLocationId
);
```

## Troubleshooting

### "User already exists" Error
The add-agency-member script will:
- Add them to the team if they exist but aren't a member
- Update their role if they're already a member
- Create them if they don't exist

### Can't Sign In
1. For Gmail users: Ensure they're using "Sign in with Google"
2. For non-Gmail: Check they're using email/password on `/signin`
3. Verify their email is in the system

### GHL Sync Issues
- Check GHL API credentials in `.env.local`
- Verify user exists in database first
- Run manual sync if needed: `npm run sync:users`

## Security Considerations

1. **Authentication**: Google OAuth or email/password via NextAuth
2. **Authorization**: Role-based access control at API level
3. **Data Isolation**: Queries filtered by team membership
4. **Password Security**: Bcrypt hashing for email/password users
5. **GHL Security**: API operations scoped by location/sub-account

## Best Practices

1. **Use Gmail when possible** - Simpler setup and more secure
2. **Assign minimal roles** - Start with 'member' and upgrade as needed
3. **Regular audits** - Review team members quarterly
4. **Document access** - Keep track of who has admin access
5. **Sync verification** - Periodically verify GHL sync status

## Future Enhancements

1. **Client Teams**: Allow businesses to add their own team members
2. **Granular Permissions**: More specific permission controls
3. **Audit Logs**: Track all team member actions
4. **2FA**: Two-factor authentication for sensitive roles
5. **API Keys**: Let clients generate API keys for integrations