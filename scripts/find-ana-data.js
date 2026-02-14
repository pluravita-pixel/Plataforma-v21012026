const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(envContent.split('\n').filter(l => l.includes('=')).map(l => l.split('=')));
const client = postgres(envVars.DATABASE_URL.replace(/['"]/g, ''));

async function findAnaData() {
    try {
        console.log("🔍 Buscando datos de Ana Gabrielle...");

        // Search in users
        const users = await client`SELECT * FROM users WHERE email = 'anagabriellelr03@gmail.com'`;
        console.log("\n👤 USERS table:", JSON.stringify(users, null, 2));

        if (users.length > 0) {
            const userId = users[0].id;

            // Search in oyentes
            const oyentes = await client`SELECT * FROM oyentes WHERE user_id = ${userId}`;
            console.log("\n🎧 OYENTES table:", JSON.stringify(oyentes, null, 2));

            // Search in tickets/support
            const tickets = await client`SELECT * FROM support_tickets WHERE user_id = ${userId}`;
            console.log("\n🎫 SUPPORT_TICKETS table:", JSON.stringify(tickets, null, 2));

            // Search in potentially other tables (guessing names)
            // Let's check for tables related to applications
            const applications = await client`SELECT * FROM listener_applications WHERE email = 'anagabriellelr03@gmail.com'`;
            console.log("\n📝 LISTENER_APPLICATIONS table:", JSON.stringify(applications, null, 2));
        }

    } catch (error) {
        console.error("❌ Error search:", error);
    } finally {
        await client.end();
    }
}

findAnaData();
