# Suite Business Commands & GHL Integration Guide

## 🚀 Quick Reference

### Agency Team Management

```bash
# Add single agency member (creates user + adds to team + syncs to GHL)
npm run add-agency-member email@gmail.com "Full Name" role

# Examples:
npm run add-agency-member john@gmail.com "John Smith" admin
npm run add-agency-member jane@gmail.com "Jane Doe" member

# Bulk add multiple members
# First edit scripts/add-agency-members-bulk.ts, then:
npm run add-agency-members-bulk
```

### Database & Setup

```bash
# Initial setup
npm run setup              # Install deps + start Docker + push DB schema
npm run setup:agency       # Create agency team structure
npm run db:clean          # Clean database (removes all data)

# Database management
npm run db:push           # Push schema changes
npm run db:studio         # Open Prisma Studio GUI
npm run docker:up         # Start PostgreSQL
npm run docker:down       # Stop PostgreSQL
```

### Development

```bash
npm run dev               # Start development server
npm run build            # Build for production
npm run start            # Start production server
```

## 👥 GHL Team Integration

### How It Works

1. **App → GHL**: Always synced (all app users must exist in GHL)
2. **GHL → App**: Optional (not all GHL users need app access)

### Adding Existing GHL Team Members

Since all your team has Gmail accounts:

```bash
# Single member
npm run add-agency-member their@gmail.com "Their Name" admin

# Multiple members - edit this file first:
# scripts/add-agency-members-bulk.ts
const teamMembers = [
  { email: 'person1@gmail.com', name: 'Person One', role: 'admin' },
  { email: 'person2@gmail.com', name: 'Person Two', role: 'member' },
];

# Then run:
npm run add-agency-members-bulk
```

### Roles

- **owner**: Super admin (defined by SUPER_ADMIN_EMAIL in .env)
- **admin**: Can manage all businesses
- **member**: View-only access

### What Happens Automatically

1. User is created in the database
2. Added to agency team with specified role
3. Synced to GoHighLevel
4. Can immediately sign in with Google

## 🔧 GHL Configuration

### Environment Variables

```env
# GoHighLevel API Keys
GHL_API_KEY=your-api-key
GHL_PRIVATE_INTEGRATIONS_KEY=your-private-key

# GoHighLevel IDs
GHL_AGENCY_ID=your-agency-id
GHL_LOCATION_ID=your-location-id

# Agency Admin
SUPER_ADMIN_EMAIL=holliday@cursivemedia.com
```

### GHL Sync Functions

Located in `lib/ghl-user-sync.ts`:
- `ensureUserInGHL()` - Creates/updates user in GHL
- `addUserToGHLSubAccount()` - Adds user to business sub-account
- `syncAllUsersToGHL()` - Maintenance task to sync all users

## 📁 Project Structure

### Key Files for Team Management

```
scripts/
├── add-agency-member.ts         # Add single member
├── add-agency-members-bulk.ts   # Add multiple members
├── setup-agency-team.ts         # Initial agency setup
└── clean-database.ts           # Reset everything

lib/
├── ghl-user-sync.ts            # GHL user synchronization
├── teams.ts                    # Team management functions
└── auth.ts                     # Authentication (Google + Email)
```

### Database Schema

```prisma
// Team structure
Team (type: 'agency' or 'client')
├── TeamMember (links users to teams)
│   ├── role: 'owner' | 'admin' | 'member'
│   └── ghlUserId: Links to GHL
└── Site (businesses belong to teams)
    └── ghlLocationId: GHL sub-account
```

## 🔄 Common Workflows

### Onboarding New Agency Team Member

```bash
# 1. Add them to the system
npm run add-agency-member newperson@gmail.com "New Person" admin

# 2. They sign in at yourapp.com/signin with Google
# 3. Done! They have access and are in GHL
```

### Check Current Team

```bash
# Open Prisma Studio to see all data
npm run db:studio

# Or check who's in GHL (manual process)
npm run find:ghl-users
```

### Reset Everything

```bash
# WARNING: Deletes all data!
npm run db:clean
npm run setup:agency
```

## 🐛 Troubleshooting

### User Can't Sign In
- Make sure they're using the exact email you added
- Check they're using Google Sign-In (not email/password)
- Verify in Prisma Studio: `npm run db:studio`

### GHL Sync Failed
- Check API keys in .env.local
- Verify GHL_LOCATION_ID is correct
- User will still work in app, just needs manual GHL setup

### Need to Change Someone's Role
```bash
# Just run the command again with new role
npm run add-agency-member same@gmail.com "Same Person" admin
```

## 📚 Additional Documentation

- `/docs/GHL_USER_SYNC.md` - Detailed sync strategy
- `/docs/NON_GMAIL_USERS.md` - For email/password users
- `/docs/ADDING_AGENCY_MEMBERS.md` - Quick member addition guide
- `/CLAUDE.md` - Overall project architecture

## 💡 Tips

1. **Bulk Operations**: For adding many users, use the bulk script
2. **Permissions**: Only super admin can add agency members
3. **GHL Limits**: Be aware of GHL API rate limits
4. **Security**: Never commit .env.local with real credentials

---

Last Updated: June 2025
