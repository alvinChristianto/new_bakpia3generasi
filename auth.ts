import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  // TAMBAHKAN INI
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
              }),
            },
          );

          if (!response.ok) return false;

          const data = await response.json();
          // 2. Tempelkan token dari Laravel ke objek user agar bisa diambil di callback JWT
          user.accessToken = data.access_token;
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
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },

    async session({ session, token }) {
      // Masukkan accessToken ke dalam Session agar bisa diakses di Client Side (useSession)
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  trustHost: true,
});
