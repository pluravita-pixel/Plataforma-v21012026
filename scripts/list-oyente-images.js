const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(envContent.split('\n').filter(l => l.includes('=')).map(l => l.split('=')));
const client = postgres(envVars.DATABASE_URL.replace(/['"]/g, ''));

async function listImages() {
    try {
        const result = await client`SELECT full_name, email, image FROM oyentes`;
        console.table(result);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

listImages();
