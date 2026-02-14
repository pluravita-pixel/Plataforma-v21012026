const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(envContent.split('\n').filter(l => l.includes('=')).map(l => l.split('=')));
const client = postgres(envVars.DATABASE_URL.replace(/['"]/g, ''));

async function updateMaria() {
    try {
        const email = 'maria.lopez@gmail.com';
        const imagePath = '/images/oyentes/maria_profile.jpg';

        const result = await client`
            UPDATE oyentes 
            SET image = ${imagePath} 
            WHERE email = ${email}
        `;
        console.log("✅ Perfil de María López actualizado con la nueva ruta de imagen.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.end();
    }
}

updateMaria();
