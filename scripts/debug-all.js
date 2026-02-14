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

async function checkAll() {
    try {
        console.log("👥 LISTANDO TODOS LOS USUARIOS:");
        const users = await client`SELECT id, email, full_name, role FROM users`;
        console.table(users);

        console.log("\n👂 LISTANDO TODOS LOS OYENTES:");
        const oyantes = await client`SELECT id, full_name, email, image FROM oyentes`;
        console.table(oyantes);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

checkAll();
