import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

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
      // Only allow sign in with Google accounts
      if (account?.provider === "google") {
        // Check if user already exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true }
        });

        if (existingUser) {
          // Check if this Google account is already linked
          const isLinked = existingUser.accounts.some(
            acc => acc.provider === "google" && acc.providerAccountId === account.providerAccountId
          );

          if (!isLinked) {
            // Link the Google account to existing user
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
          }
        }
        
        return true;
      }
      return false;
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
