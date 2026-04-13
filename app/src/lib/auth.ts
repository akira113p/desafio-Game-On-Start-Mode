import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/*
 * ===== CONFIGURACAO NextAuth para Producao (Vercel) =====
 *
 * Variaveis de ambiente necessarias no painel da Vercel:
 *   - GOOGLE_CLIENT_ID
 *   - GOOGLE_CLIENT_SECRET
 *   - NEXTAUTH_SECRET  (obrigatorio em producao)
 *
 * NEXTAUTH_URL:
 *   - Em producao na Vercel, NAO e necessario definir NEXTAUTH_URL.
 *     A Vercel injeta automaticamente a variavel VERCEL_URL e o
 *     NextAuth a utiliza como fallback.
 *   - Se voce usar um dominio customizado (ex: meuapp.com.br),
 *     defina NEXTAUTH_URL=https://meuapp.com.br no painel da Vercel.
 *   - Localmente, defina NEXTAUTH_URL=http://localhost:3000 no .env.local.
 *
 * Google Cloud Console - URIs de redirecionamento:
 *   Adicione AMBAS as URIs em "Authorized redirect URIs":
 *     - http://localhost:3000/api/auth/callback/google        (local)
 *     - https://SEU-APP.vercel.app/api/auth/callback/google   (producao)
 */

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },

  pages: {
    signIn: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
