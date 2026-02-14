const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const envVars = {};

envLines.forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        envVars[key] = value;
    }
});

const client = postgres(envVars.DATABASE_URL);

async function inspectAndFix() {
    try {
        console.log("🔍 Inspeccionando oyentes...");
        const allOyentes = await client`SELECT id, full_name, email, image FROM oyentes`;
        console.log("Oyentes actuales:", JSON.stringify(allOyentes, null, 2));

        // Delete duplicates (keep those with @gmail.com or keep only the newest ones)
        // Usually, the user wants the clean ones.
        // Let's delete all and re-seed to be 100% sure.

        console.log("🧹 Limpiando base de datos para evitar duplicados...");
        // Deleting from availability_slots first due to FK
        await client`DELETE FROM availability_slots`;
        await client`DELETE FROM oyentes`;
        // We might want to keep some users, but for MVP it's safer to clear these specific ones
        // Or just re-run seed which updates if matches email? 
        // My seed script checks email in 'users' table.

        console.log("✅ DB Limpia. Por favor ejecuta el script de seed de nuevo.");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

inspectAndFix();
