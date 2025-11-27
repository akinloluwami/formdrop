import { config } from 'dotenv'

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema.ts'

config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  // Force the search path to public to ensure migrations and queries work as expected
  options: "-c search_path=public",
})
export const db = drizzle(pool, { schema })
