import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core"

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  content: text("content").notNull(),
  author: varchar("author", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
})
