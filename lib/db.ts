// Only import server-only in Next.js environment
if (typeof window === 'undefined' && process.env.NEXT_RUNTIME) {
  require("server-only");
}
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as schema from "./schema"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool, { schema })
