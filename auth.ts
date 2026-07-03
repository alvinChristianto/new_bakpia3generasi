import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

/** Carries the backend's error_code (e.g. "oauth_only") out to the login page. */
class LoginError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email : "";
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";
        if (!email || !password) throw new LoginError("invalid_credentials");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BE_ROUTE}/api/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ email, password }),
          },
        );

        if (!res.ok) {
          // Surface the backend's error_code so the login page can distinguish
          // a passwordless (Google-only) account from a wrong password.
          let code = "invalid_credentials";
          try {
            const body = await res.json();
            if (body?.error_code) code = body.error_code;
          } catch {
            // ignore parse errors, fall back to generic code
          }
          throw new LoginError(code);
        }

        const data = await res.json();
        if (!data?.access_token || !data?.user) {
          throw new LoginError("invalid_credentials");
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          accessToken: data.access_token,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login", // Jika terjadi error atau butuh login, lari ke sini
    error: "/login", // Halaman untuk menampilkan error auth
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // 1. Kirim data OAuth ke Backend Laravel
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BE_ROUTE}/api/auth/google/callback`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                google_id: user.id,
                avatar: user.image,
              }),
            },
          );

          if (!response.ok) return false;

          const data = await response.json();
          // 2. Tempelkan token + flag ke objek user agar bisa diambil di callback JWT
          user.accessToken = data.access_token;
          user.needsPhone = data.needs_phone;
          return true;
        } catch (error) {
          console.error("Laravel Auth Error:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // Masukkan accessToken ke dalam JWT layer
      if (user) {
        const u = user as { accessToken?: string; needsPhone?: boolean };
        const t = token as { accessToken?: string; needsPhone?: boolean };
        t.accessToken = u.accessToken;
        if (u.needsPhone !== undefined) {
          t.needsPhone = u.needsPhone;
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Masukkan accessToken ke dalam Session agar bisa diakses di Client Side (useSession)
      const t = token as { accessToken?: string; needsPhone?: boolean };
      if (t.accessToken) {
        session.accessToken = t.accessToken;
      }
      session.needsPhone = t.needsPhone;
      return session;
    },
  },
  trustHost: true,
});
