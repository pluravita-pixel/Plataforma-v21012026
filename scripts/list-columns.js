const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(envContent.split('\n').filter(l => l.includes('=')).map(l => l.split('=')));
const client = postgres(envVars.DATABASE_URL.replace(/['"]/g, ''));

async function listColumns() {
    try {
        const columns = await client`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'oyente_solicitudes'
        `;
        console.log(JSON.stringify(columns, null, 2));
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

listColumns();
