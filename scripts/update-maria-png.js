const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(envContent.split('\n').filter(l => l.includes('=')).map(l => l.split('=')));
const client = postgres(envVars.DATABASE_URL.replace(/['"]/g, ''));

async function updateMariaPng() {
    try {
        const email = 'maria.lopez@gmail.com';
        const imagePath = '/images/oyentes/maria_profile.png';

        await client`
            UPDATE oyentes 
            SET image = ${imagePath} 
            WHERE email = ${email}
        `;
        console.log("✅ Perfil de María López actualizado con .png");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

updateMariaPng();
