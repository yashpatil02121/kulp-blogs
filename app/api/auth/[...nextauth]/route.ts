import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db';
import { profiles } from '@/lib/schema';
import { eq } from 'drizzle-orm';

interface GoogleProfile {
  sub: string;
  name: string;
  email: string;
  picture: string;
  locale?: string;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    profile?: typeof profiles.$inferSelect;
  }
  interface JWT {
    profile?: typeof profiles.$inferSelect;
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET!,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const googleProfile = profile as GoogleProfile;
        if (!googleProfile?.sub) {
          console.error("No profile.sub found");
          return false;
        }

        const { email, name, image } = user;
        const access_token = account?.access_token;
        const refresh_token = account?.refresh_token;
        const expires_in = account?.expires_at;

        const userExists = await db
          .select()
          .from(profiles)
          .where(eq(profiles.provider_user_id, googleProfile.sub))
          .limit(1);
    
        const tokenExpiresAt = expires_in ? new Date(expires_in * 1000) : null;

        if (userExists.length > 0) {
          await db
            .update(profiles)
            .set({
              provider: 'google',
              email: email || undefined,
              full_name: name || undefined,
              avatar_url: image || undefined,
              locale: googleProfile.locale,
              access_token,
              refresh_token,
              token_expires_at: tokenExpiresAt,
              updated_at: new Date(),
            })
            .where(eq(profiles.provider_user_id, googleProfile.sub));
        } else {
          await db.insert(profiles).values({
            provider: 'google',
            provider_user_id: googleProfile.sub,
            email: email || undefined,
            full_name: name || undefined,
            avatar_url: image || undefined,
            locale: googleProfile.locale,
            access_token,
            refresh_token,
            token_expires_at: tokenExpiresAt,
            updated_at: new Date(),
          });
        }

        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },

    async jwt({ token }) {
      if (token.sub) {
        try {
          const profileData = await db
            .select()
            .from(profiles)
            .where(eq(profiles.provider_user_id, token.sub))
            .limit(1);

          if (profileData.length > 0) {
            token.profile = profileData[0];
          }
        } catch (error) {
          console.error("Error fetching profile in jwt callback:", error);
        }
      }
      return token;
    },
       
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub as string;
      }

      if (token.profile && typeof token.profile === 'object' && 'id' in token.profile) {
        session.profile = token.profile as typeof profiles.$inferSelect;
      }

      return session;
    },
  },

  pages: {
    signIn: '/auth/signin',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };