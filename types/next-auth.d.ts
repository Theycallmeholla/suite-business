import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      sites?: Array<{
        id: string;
        businessName: string;
        subdomain: string;
      }>;
      hasSites?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}