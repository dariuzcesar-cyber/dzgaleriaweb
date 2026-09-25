import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  pages: {
    error: '/acceso-denegado',
  },
  callbacks: {
    async signIn({ user }) {
      return user.email === process.env.ALLOWED_ADMIN_EMAIL;
    },
    async session({ session }) {
      return session;
    },
  },
};
