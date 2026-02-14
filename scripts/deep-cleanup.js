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

async function deepCleanup() {
    try {
        console.log("🧹 Iniciando limpieza profunda de perfiles MVP...");

        // Delete all oyentes and users with .test OR specific names to avoid confusion
        const names = ["María López García", "Carlos Martínez Ruiz", "Laura Fernández Sánchez"];

        await client`DELETE FROM availability_slots WHERE oyente_id IN (SELECT id FROM oyentes WHERE full_name IN ${names})`;
        await client`DELETE FROM oyentes WHERE full_name IN ${names}`;
        await client`DELETE FROM users WHERE full_name IN ${names}`;

        console.log("✅ Limpieza completada. Ahora se puede re-sembrar sin conflictos.");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

deepCleanup();
