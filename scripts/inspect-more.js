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

async function inspectMore() {
    try {
        console.log("📝 SOLICITUDES DE OYENTES:");
        const solicitudes = await client`SELECT * FROM oyente_solicitudes`;
        console.table(solicitudes);

        console.log("\n📁 TICKETS DE SOPORTE:");
        const tickets = await client`SELECT * FROM support_tickets`;
        console.table(tickets);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

inspectMore();
