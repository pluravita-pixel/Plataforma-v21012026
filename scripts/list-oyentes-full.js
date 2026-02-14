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

async function listOyentes() {
    try {
        const oyantes = await client`SELECT u.email, u.full_name as user_name, o.full_name as oyente_name, o.id FROM oyentes o JOIN users u ON o.user_id = u.id`;
        console.table(oyantes);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

listOyentes();
