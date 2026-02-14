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

async function restoreAna() {
    try {
        console.log("🔍 Buscando a Ana Gabrielle...");
        let user = await client`SELECT id FROM users WHERE email = 'anagabriellelr03@gmail.com' LIMIT 1`;
        let userId;

        if (user.length === 0) {
            console.log("📝 Usuario no encontrado. Creándolo...");
            const newUser = await client`
                INSERT INTO users (email, full_name, role)
                VALUES ('anagabriellelr03@gmail.com', 'Ana Gabrielle Ribeiro de Lima Moraes', 'oyente')
                RETURNING id
            `;
            userId = newUser[0].id;
        } else {
            userId = user[0].id;
            console.log("✅ Usuario encontrado:", userId);
            // Asegurarnos de que tiene el rol correcto
            await client`UPDATE users SET role = 'oyente' WHERE id = ${userId}`;
        }

        console.log("✨ Creando perfil de oyente para Ana...");

        // Verificar si ya tiene perfil de oyente
        const existingOyente = await client`SELECT id FROM oyentes WHERE user_id = ${userId} LIMIT 1`;

        if (existingOyente.length === 0) {
            await client`
                INSERT INTO oyentes (
                    user_id, full_name, email, specialty, price, description,
                    languages, tags, studies, benefits, experience,
                    total_sessions, completed_sessions, active_usuarios, total_usuarios, rating
                )
                VALUES (
                    ${userId}, 'Ana Gabrielle Ribeiro de Lima Moraes', 'anagabriellelr03@gmail.com',
                    'Acompañamiento Emocional', '35.00', 
                    'Hola, soy Ana. Ofrezco un espacio de escucha activa y apoyo emocional para ayudarte a transitar tus procesos personales con empatía y sin juicios.',
                    ARRAY['Español', 'Portugués'], 
                    ARRAY['Empatía', 'Escucha', 'Apoyo'],
                    'Psicología (Estudiante)',
                    ARRAY['Atención personalizada', 'Espacio seguro', 'Flexibilidad'],
                    'Experiencia en voluntariado y apoyo comunitario.',
                    0, 0, 0, 0, '5.0'
                )
            `;
            console.log("✅ Perfil de oyente creado.");
        } else {
            console.log("⚠️ El perfil de oyente ya existe.");
        }

    } catch (error) {
        console.error("❌ Error restaurando a Ana:", error);
    } finally {
        await client.end();
    }
}

restoreAna();
