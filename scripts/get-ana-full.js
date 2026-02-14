const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(envContent.split('\n').filter(l => l.includes('=')).map(l => l.split('=')));
const client = postgres(envVars.DATABASE_URL.replace(/['"]/g, ''));

async function getAnaDetails() {
    try {
        const result = await client`SELECT * FROM oyente_solicitudes WHERE email = 'anagabriellelr03@gmail.com'`;
        console.log("APP DATA:", JSON.stringify(result, null, 2));

        const oyente = await client`SELECT * FROM oyentes WHERE email = 'anagabriellelr03@gmail.com'`;
        console.log("OYENTE PROFILE:", JSON.stringify(oyente, null, 2));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

getAnaDetails();
