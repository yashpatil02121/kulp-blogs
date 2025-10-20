import { profiles } from './schema';

export type Profile = typeof profiles.$inferSelect;

declare module 'next-auth' {
  interface Session {
    profile?: Profile;
  }
}
