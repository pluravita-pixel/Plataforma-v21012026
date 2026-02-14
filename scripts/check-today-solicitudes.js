const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(envContent.split('\n').filter(l => l.includes('=')).map(l => l.split('=')));
const client = postgres(envVars.DATABASE_URL.replace(/['"]/g, ''));

async function checkTodaySolicitudes() {
    try {
        const result = await client`SELECT * FROM oyente_solicitudes WHERE created_at > '2026-02-14'`;
        console.log("TODAY SOLICITUDES:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

checkTodaySolicitudes();
