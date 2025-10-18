import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db'; // Drizzle connection
import { profiles } from '@/lib/schema'; // Drizzle schema
import { eq } from 'drizzle-orm'; // Import eq function
export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!profile?.sub) {
          console.error("No profile.sub found");
          return false;
        }

        const { email, name, image, locale } = user;
        const { access_token, refresh_token, expires_in } = account || {};

        // Check if user exists in database
        const userExists = await db
          .select()
          .from(profiles)
          .where(eq(profiles.provider_user_id, profile.sub)) // Use eq() function
          .limit(1);
    
        const tokenExpiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : null;

        if (userExists.length > 0) {
          await db
            .update(profiles)
            .set({
              provider: 'google',
              email,
              full_name: name,
              avatar_url: image,
              locale,
              access_token,
              refresh_token,
              token_expires_at: tokenExpiresAt,
              updated_at: new Date(),
            })
            .where(eq(profiles.provider_user_id, profile.sub)); // Use eq() function for the condition
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
            token_expires_at: tokenExpiresAt,
            updated_at: new Date(),
          });
        }
    
        return '/'; // Redirect to home page after successful sign-in
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