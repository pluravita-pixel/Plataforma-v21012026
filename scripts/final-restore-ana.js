const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(envContent.split('\n').filter(l => l.includes('=')).map(l => l.split('=')));
const client = postgres(envVars.DATABASE_URL.replace(/['"]/g, ''));

async function restoreAna() {
    try {
        console.log("🔍 Restaurando perfil de Ana Gabrielle con sus datos reales...");

        const email = 'anagabriellelr03@gmail.com';
        const user = await client`SELECT id FROM users WHERE email = ${email} LIMIT 1`;

        if (user.length === 0) {
            console.log("❌ Usuario no encontrado.");
            return;
        }

        const userId = user[0].id;

        // Update user (ensure role and phone)
        await client`UPDATE users SET role = 'oyente', phone = '5491164693555' WHERE id = ${userId}`;

        const studies = "Estudiante de Psicología con mención en Psicología Clínica.";
        const experience = "Actualmente colaboro en la Asociación Contra el Cáncer, donde realizo labores de escucha activa, acompañamiento emocional y apoyo a pacientes y familiares. Formada en intervención psicológica y atención centrada en la persona.";
        const description = "Ofrezco un espacio donde pueda acompañar a las personas desde la escucha activa, generando contención, empatía y un lugar seguro para expresarse.";

        const existingOyente = await client`SELECT id FROM oyentes WHERE user_id = ${userId} LIMIT 1`;

        if (existingOyente.length > 0) {
            await client`
                UPDATE oyentes SET
                    full_name = 'Ana Gabrielle Ribeiro de Lima Moraes',
                    specialty = 'Acompañamiento Emocional y Escucha Activa',
                    price = '35.00',
                    description = ${description},
                    experience = ${experience},
                    studies = ${studies},
                    languages = ARRAY['Español', 'Portugués'],
                    tags = ARRAY['Empatía', 'Escucha Activa', 'Apoyo Emocional'],
                    benefits = ARRAY['Espacio seguro y sin juicios', 'Contención emocional', 'Flexibilidad horaria']
                WHERE user_id = ${userId}
            `;
            console.log("✅ Perfil de oyente actualizado con datos de la solicitud.");
        } else {
            await client`
                INSERT INTO oyentes (
                    user_id, full_name, email, specialty, price, description,
                    experience, studies, languages, tags, benefits,
                    total_sessions, completed_sessions, active_usuarios, total_usuarios, rating
                ) VALUES (
                    ${userId}, 'Ana Gabrielle Ribeiro de Lima Moraes', ${email}, 
                    'Acompañamiento Emocional y Escucha Activa', '35.00', ${description},
                    ${experience}, ${studies}, ARRAY['Español', 'Portugués'], 
                    ARRAY['Empatía', 'Escucha Activa', 'Apoyo Emocional'],
                    ARRAY['Espacio seguro y sin juicios', 'Contención emocional', 'Flexibilidad horaria'],
                    0, 0, 0, 0, '5.0'
                )
            `;
            console.log("✅ Perfil de oyente creado con datos de la solicitud.");
        }

        // Add slots for the next 7 days if they don't exist
        const oyenteRecord = await client`SELECT id FROM oyentes WHERE user_id = ${userId} LIMIT 1`;
        const oyenteId = oyenteRecord[0].id;

        const slots = await client`SELECT count(*) FROM availability_slots WHERE oyente_id = ${oyenteId}`;
        if (parseInt(slots[0].count) === 0) {
            console.log("📅 Generando slots de disponibilidad...");
            const now = new Date();
            for (let i = 1; i <= 7; i++) {
                const date = new Date(now);
                date.setDate(now.getDate() + i);
                const hours = [9, 10, 11, 16, 17, 18, 19, 20]; // 8 slots per day
                for (const h of hours) {
                    const start = new Date(date);
                    start.setHours(h, 0, 0, 0);
                    const end = new Date(start);
                    end.setHours(h + 1, 0, 0, 0);
                    await client`INSERT INTO availability_slots (oyente_id, start_time, end_time, is_booked) VALUES (${oyenteId}, ${start}, ${end}, false)`;
                }
            }
            console.log("✅ Slots generados.");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await client.end();
    }
}

restoreAna();
