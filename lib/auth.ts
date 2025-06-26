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
          const cookieStore = cookies();
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
                await addToAgencyTeam(dbUser.id, 'owner');
                logger.info('Added user to agency team as owner', {
                  metadata: { email: user.email }
                });
              } catch (error) {
                logger.error('Failed to add user to agency team', {}, error as Error);
              }
            }
          }, 1000); // Wait a second for user creation
        }

        if (existingUser) {
          // Check if this Google account is already linked
          const isLinked = existingUser.accounts.some(
            acc => acc.provider === "google" && acc.providerAccountId === account.providerAccountId
          );

          if (!isLinked) {
            // Check if there's an authenticated session and it belongs to the same user
            // This indicates the user is adding an additional Google account
            const isAddingAccount = existingSession && 
                                   existingSession.userId === existingUser.id;

            if (isAddingAccount) {
              // User is authenticated and adding a new Google account
              try {
                await prisma.account.create({
                  data: {
                    userId: existingUser.id,
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
                logger.info('Successfully linked additional Google account', {
                  metadata: { 
                    userId: existingUser.id,
                    googleAccountId: account.providerAccountId 
                  }
                });
                return true;
              } catch (error) {
                logger.error('Error linking account', {}, error as Error);
                // If account already exists (race condition), it's ok
                if ((error as any).code !== 'P2002') {
                  return false;
                }
                return true; // Account already linked, allow sign in
              }
            } else {
              // Different user or no session - don't allow automatic linking
              logger.warn('Attempted to sign in with unlinked Google account', {
                metadata: {
                  email: user.email,
                  hasSession: !!existingSession,
                  sessionUserId: existingSession?.userId,
                  existingUserId: existingUser.id
                }
              });
              return false;
            }
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
  debug: process.env.NODE_ENV === "development",
});

// Helper to get server session
export async function getAuthSession() {
  return await auth();
}
