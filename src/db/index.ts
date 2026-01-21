import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// For query purposes
// Disable prefetch and prepare for Supabase Transaction Pooler compatibility
// Use permissive SSL to avoid certificate validation issues
const client = postgres(connectionString, {
    prepare: false,
    ssl: { rejectUnauthorized: false }
});
export { client };
export const db = drizzle(client, { schema });
