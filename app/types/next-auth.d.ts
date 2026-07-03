import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    needsPhone?: boolean;
    user: {
      id?: string;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
    needsPhone?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    needsPhone?: boolean;
  }
}
