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

async function findVips() {
    try {
        console.log("🧬 ANALIZANDO TESTS DE AFINIDAD:");
        const tests = await client`
            SELECT u.email, u.full_name, u.role, af.created_at 
            FROM affinity_tests af
            JOIN users u ON af.user_id = u.id
            ORDER BY af.created_at DESC
        `;
        console.table(tests);

        console.log("\n💬 ANALIZANDO CITAS:");
        const appts = await client`
            SELECT u.email as user_email, u.full_name as user_name, o.full_name as oyente_name, a.created_at
            FROM appointments a
            JOIN users u ON a.usuario_id = u.id
            JOIN oyentes o ON a.oyente_id = o.id
            ORDER BY a.created_at DESC
        `;
        console.table(appts);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

findVips();
