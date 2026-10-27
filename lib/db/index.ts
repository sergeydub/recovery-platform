import "server-only";

import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Lets Vercel close idle connections before a function is suspended.
attachDatabasePool(pool);

export const db = drizzle({ client: pool, schema, casing: "snake_case" });
