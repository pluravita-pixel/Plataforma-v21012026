const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(envContent.split('\n').filter(l => l.includes('=')).map(l => l.split('=')));
const client = postgres(envVars.DATABASE_URL.replace(/['"]/g, ''));

async function findMaria() {
    try {
        const result = await client`SELECT * FROM oyentes WHERE full_name ILIKE '%María López%'`;
        console.log("MARIA DATA:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

findMaria();
