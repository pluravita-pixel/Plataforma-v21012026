import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/postgres";

const client = postgres(connectionString, {
    prepare: false,
    ssl: { rejectUnauthorized: false },
    max: 1
});
export { client };
export const db = drizzle(client, { schema });
