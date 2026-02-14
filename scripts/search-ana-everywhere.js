const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(envContent.split('\n').filter(l => l.includes('=')).map(l => l.split('=')));
const client = postgres(envVars.DATABASE_URL.replace(/['"]/g, ''));

async function searchEverywhere() {
    try {
        const tables = await client`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;

        for (const table of tables) {
            const tableName = table.table_name;
            try {
                // Search for email or Gabrielle in every table that has columns
                const columns = await client`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = ${tableName}
                `;

                const hasEmail = columns.some(c => c.column_name === 'email');
                const hasFullName = columns.some(c => c.column_name === 'full_name');
                const hasName = columns.some(c => c.column_name === 'name');
                const hasUserId = columns.some(c => c.column_name === 'user_id');

                let results = [];
                if (hasEmail) {
                    results = await client.unsafe(`SELECT * FROM ${tableName} WHERE email ILIKE '%anagabrielle%' OR email ILIKE '%ana%gabrielle%'`);
                } else if (hasFullName) {
                    results = await client.unsafe(`SELECT * FROM ${tableName} WHERE full_name ILIKE '%Gabrielle%'`);
                } else if (hasName) {
                    results = await client.unsafe(`SELECT * FROM ${tableName} WHERE name ILIKE '%Gabrielle%'`);
                }

                if (results.length > 0) {
                    console.log(`\n📍 TABLE: ${tableName}`);
                    console.log(JSON.stringify(results, null, 2));
                }
            } catch (e) {
                // Skip tables that fail (maybe no permissions or special types)
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

searchEverywhere();
