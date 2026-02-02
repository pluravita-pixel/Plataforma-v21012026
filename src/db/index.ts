import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/postgres";

const client = postgres(connectionString, {
    prepare: false,
    ssl: { rejectUnauthorized: false },
    max: 10, // Aumentado para evitar colas en serverless
    idle_timeout: 20, // Cerrar conexiones inactivas tras 20s
});
export { client };
export const db = drizzle(client, { schema });
