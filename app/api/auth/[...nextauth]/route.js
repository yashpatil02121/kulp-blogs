import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db'; // Drizzle connection
import { profiles } from '@/lib/schema'; // Drizzle schema
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const { email, name, image, locale } = user;
        const { access_token, refresh_token, expires_in } = account;
    
        // Check if user exists in database
        const userExists = await db
          .select()
          .from(profiles)
          .where(profiles.provider_user_id.isEqual(profile.sub)) // Use `.isEqual()` here
          .limit(1);
    
        if (userExists.length > 0) {
          await db
            .update(profiles)
            .set({
              email,
              full_name: name,
              avatar_url: image,
              locale,
              access_token,
              refresh_token,
              token_expires_at: new Date(Date.now() + expires_in * 1000),
              updated_at: new Date(),
            })
            .where(profiles.provider_user_id.isEqual(profile.sub)); // Use `.isEqual()` for the condition
        } else {
          await db.insert(profiles).values({
            provider: 'google',
            provider_user_id: profile.sub,
            email,
            full_name: name,
            avatar_url: image,
            locale,
            access_token,
            refresh_token,
            token_expires_at: new Date(Date.now() + expires_in * 1000),
            updated_at: new Date(),
          });
        }
    
        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },
       
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin', // Custom sign-in page path
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };