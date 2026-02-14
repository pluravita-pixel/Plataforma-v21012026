const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(envContent.split('\n').filter(l => l.includes('=')).map(l => l.split('=')));
const client = postgres(envVars.DATABASE_URL.replace(/['"]/g, ''));

async function findAna() {
    try {
        const user = await client`SELECT * FROM users WHERE email = 'anagabriellelr03@gmail.com'`;
        console.log("USER:", JSON.stringify(user, null, 2));

        if (user.length > 0) {
            const oyente = await client`SELECT * FROM oyentes WHERE user_id = ${user[0].id}`;
            console.log("OYENTE:", JSON.stringify(oyente, null, 2));
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

findAna();
