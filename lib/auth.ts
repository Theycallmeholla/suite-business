import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "email",
            "profile",
            // Google Business Profile scopes
            "https://www.googleapis.com/auth/business.manage",
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow Google authentication
      if (account?.provider === "google") {
        // First, let's check if there's an existing authenticated session
        // This helps us determine if this is an "add account" flow
        let existingSession = null;
        try {
          // Get the current session from cookies to check if user is already logged in
          const cookieStore = await cookies();
          const sessionToken = cookieStore.get('authjs.session-token')?.value || 
                              cookieStore.get('__Secure-authjs.session-token')?.value;
          
          if (sessionToken) {
            existingSession = await prisma.session.findUnique({
              where: { sessionToken },
              include: { user: true }
            });
          }
        } catch (error) {
          logger.error('Error checking existing session', {}, error as Error);
        }

        // If there's an existing session, this is an "add account" flow
        if (existingSession && existingSession.user) {
          // User is already authenticated and adding an additional Google account
          // This account will ONLY be used for GBP access, not for signing in
          try {
            // Check if this Google account is already linked to the current user
            const existingLink = await prisma.account.findFirst({
              where: {
                userId: existingSession.userId,
                provider: "google",
                providerAccountId: account.providerAccountId
              }
            });

            if (!existingLink) {
              // Link this Google account to the current user
              // Even if another user has this as their primary account, 
              // we can still add it as an additional account for GBP access
              await prisma.account.create({
                data: {
                  userId: existingSession.userId,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                }
              });
              logger.info('Successfully linked additional Google account for GBP access', {
                metadata: { 
                  userId: existingSession.userId,
                  googleAccountId: account.providerAccountId,
                  email: user.email
                }
              });
            }
            return true;
          } catch (error) {
            logger.error('Error linking additional account', {}, error as Error);
            return false;
          }
        }

        // No existing session - this is a regular sign in flow
        // Check if user already exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true }
        });

        // Check if this user should be added to agency team
        const superAdminEmails = process.env.SUPER_ADMIN_EMAIL?.split(',').map(e => e.trim()) || [];
        if (user.email && superAdminEmails.includes(user.email)) {
          // Import the teams module
          const { addToAgencyTeam } = await import('@/lib/teams');
          
          // Get or wait for the user to be created
          setTimeout(async () => {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email! }
            });
            
            if (dbUser) {
              try {
                // Check if user is already in the agency team
                const { isAgencyTeamMember } = await import('@/lib/teams');
                const isMember = await isAgencyTeamMember(dbUser.id);
                
                if (!isMember) {
                  await addToAgencyTeam(dbUser.id, 'owner');
                  logger.info('Added user to agency team as owner', {
                    metadata: { email: user.email }
                  });
                } else {
                  logger.info('User already in agency team', {
                    metadata: { email: user.email }
                  });
                }
              } catch (error) {
                logger.error('Failed to add user to agency team', {}, error as Error);
              }
            }
          }, 1000); // Wait a second for user creation
        }

        // For regular sign in, verify the Google account is linked to this user
        if (existingUser) {
          const isLinked = existingUser.accounts.some(
            acc => acc.provider === "google" && acc.providerAccountId === account.providerAccountId
          );
          
          if (!isLinked) {
            // This Google account is not linked to this user for sign in
            logger.warn('Google account not linked to this user for sign in', {
              metadata: {
                email: user.email,
                googleAccountId: account.providerAccountId
              }
            });
            return false;
          }
        }
        
        return true;
      }
      return false; // Only allow Google provider
    },
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = user.id;
        
        // Check if user has any sites
        const userSites = await prisma.site.findMany({
          where: { userId: user.id },
          select: { id: true, businessName: true, subdomain: true },
        });
        
        session.user.sites = userSites;
        session.user.hasSites = userSites.length > 0;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Preserve the full URL including query parameters
      const urlObj = new URL(url, baseUrl);
      
      // If the URL already has a specific path (not just root), respect it
      if (urlObj.pathname !== '/' && url.startsWith(baseUrl)) {
        return url;
      }
      
      // Check if we have a callbackUrl parameter
      const callbackUrl = urlObj.searchParams.get('callbackUrl');
      if (callbackUrl && callbackUrl.startsWith('/')) {
        return `${baseUrl}${callbackUrl}`;
      }
      
      // For root redirects, go to dashboard
      // The dashboard will handle redirecting to onboarding if needed
      return `${baseUrl}/dashboard`;
    },
  },
  events: {
    // Store tokens after account is linked
    async linkAccount({ user, account }) {
      if (account.provider === "google" && account.access_token && account.refresh_token) {
        // The account is already created by PrismaAdapter at this point
        // We can safely update it with the tokens
        await prisma.account.update({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          data: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
          },
        });
      }
    },
    async createUser({ user }) {
      // Check if this user should be added to agency team
      const superAdminEmails = process.env.SUPER_ADMIN_EMAIL?.split(',').map(e => e.trim()) || [];
      if (user.email && superAdminEmails.includes(user.email)) {
        const { addToAgencyTeam } = await import('@/lib/teams');
        try {
          await addToAgencyTeam(user.id, 'owner');
          logger.info('Added user to agency team as owner', {
            metadata: { email: user.email }
          });
        } catch (error) {
          logger.error('Failed to add user to agency team', {}, error as Error);
        }
      }
      
      // Ensure user exists in GHL (for agency location)
      const { ensureUserInGHL } = await import('@/lib/ghl-user-sync');
      try {
        await ensureUserInGHL(user.id);
        logger.info('Ensured user exists in GHL', {
          metadata: { email: user.email }
        });
      } catch (error) {
        logger.error('Failed to create user in GHL', {}, error as Error);
        // Don't block sign up if GHL fails
      }
    },
  },
  pages: {
    signIn: "/signin",
    error: "/error",
  },
  session: {
    strategy: "database",
  },
  debug: false,
});

// Helper to get server session
export async function getAuthSession() {
  return await auth();
}
