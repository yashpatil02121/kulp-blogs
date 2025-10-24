import { pgTable, serial, text, timestamp, varchar, unique } from "drizzle-orm/pg-core"

// Only import server-only in Next.js environment
if (typeof window === 'undefined' && process.env.NEXT_RUNTIME) {
  require("server-only");
}

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  content: text("content").notNull(),
  author: varchar("author", { length: 100 }),
  embedding: text("embedding"),
  createdAt: timestamp("created_at").defaultNow(),
})


export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  provider: varchar('provider', { length: 50 }).notNull(),
  provider_user_id: varchar('provider_user_id', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique(),
  full_name: varchar('full_name', { length: 255 }),
  avatar_url: text('avatar_url'),
  locale: varchar('locale', { length: 20 }),
  access_token: text('access_token'),
  refresh_token: text('refresh_token'),
  token_expires_at: timestamp('token_expires_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at'),
});