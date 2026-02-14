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

async function addSlotsForAna() {
    try {
        console.log("📅 Creando horarios para Ana Gabrielle...");

        const oyente = await client`SELECT id FROM oyentes WHERE email = 'anagabriellelr03@gmail.com' LIMIT 1`;

        if (oyente.length === 0) {
            console.log("❌ Ana no encontrada en la tabla oyentes.");
            return;
        }

        const oyenteDbId = oyente[0].id;

        // Limpiar slots antiguos si existen
        await client`DELETE FROM availability_slots WHERE oyente_id = ${oyenteDbId}`;

        // Crear slots para los próximos 7 días
        const now = new Date();

        for (let day = 1; day <= 7; day++) {
            const date = new Date(now);
            date.setDate(now.getDate() + day);

            // Horarios: 9:00, 10:00, 11:00, 16:00, 17:00, 18:00
            const hours = [9, 10, 11, 16, 17, 18];

            for (const hour of hours) {
                const startTime = new Date(date);
                startTime.setHours(hour, 0, 0, 0);

                const endTime = new Date(startTime);
                endTime.setHours(hour + 1, 0, 0, 0);

                await client`
                    INSERT INTO availability_slots (oyente_id, start_time, end_time, is_booked)
                    VALUES (${oyenteDbId}, ${startTime.toISOString()}, ${endTime.toISOString()}, ${false})
                `;
            }
        }

        console.log("✅ 42 horarios creados para Ana Gabrielle.");

    } catch (error) {
        console.error("❌ Error creando horarios:", error);
    } finally {
        await client.end();
    }
}

addSlotsForAna();
