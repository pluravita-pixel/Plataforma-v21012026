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

async function cleanupImages() {
    console.log("🛠️ Iniciando limpieza de imágenes corruptas (artifact:)...");

    try {
        const badImages = await client`
            SELECT id, full_name, image FROM oyentes WHERE image LIKE 'artifact:%'
        `;

        console.log(`🔍 Encontrados ${badImages.length} perfiles con imágenes de artefactos.`);

        for (const profile of badImages) {
            console.log(`🧹 Limpiando perfil: ${profile.full_name}`);
            await client`
                UPDATE oyentes 
                SET image = NULL 
                WHERE id = ${profile.id}
            `;
        }

        console.log("✅ ¡Limpieza completada!");
    } catch (error) {
        console.error("❌ Error durante la limpieza:", error);
    } finally {
        await client.end();
    }
}

cleanupImages();
