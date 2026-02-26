const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

// Simple .env.local parser
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const env = {};
lines.forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        env[match[1]] = value;
    }
});

const connectionString = env.DIRECT_URL || env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ No se encontró la URL de la base de datos");
    process.exit(1);
}

const sql = postgres(connectionString);

async function updateData() {
    console.log("🚀 Actualizando precios y disponibilidad...");

    try {
        // 1. Actualizar precios
        await sql`UPDATE oyentes SET price = 34.00 WHERE full_name ILIKE '%María López%'`;
        await sql`UPDATE oyentes SET price = 22.00 WHERE full_name ILIKE '%Carlos Martínez%'`;
        console.log("✅ Precios actualizados: María (34€), Carlos (22€)");

        // 2. Actualizar disponibilidad
        const oyenteIds = await sql`SELECT id FROM oyentes WHERE is_hidden IS NOT TRUE`;

        for (const row of oyenteIds) {
            const oyenteId = row.id;

            // Borrar slots existentes para empezar de cero
            await sql`DELETE FROM availability_slots WHERE oyente_id = ${oyenteId}`;

            const now = new Date();
            for (let i = 0; i < 7; i++) {
                const day = new Date(now);
                day.setDate(now.getDate() + i);
                day.setHours(0, 0, 0, 0);

                // 4 horas al día (ej: 10, 11, 16, 17)
                const hours = [10, 11, 16, 17];

                // Shuffle hours to book 2-3 randomly
                const shuffled = [...hours].sort(() => 0.5 - Math.random());
                const numToBook = Math.floor(Math.random() * 2) + 2; // 2 o 3
                const bookedHours = shuffled.slice(0, numToBook);

                for (const h of hours) {
                    const startTime = new Date(day);
                    startTime.setHours(h);

                    const endTime = new Date(startTime);
                    endTime.setHours(h + 1);

                    const isBooked = bookedHours.includes(h);

                    await sql`INSERT INTO availability_slots (oyente_id, start_time, end_time, is_booked) 
                              VALUES (${oyenteId}, ${startTime.toISOString()}, ${endTime.toISOString()}, ${isBooked})`;
                }
            }
        }
        console.log("✅ Disponibilidad actualizada: 4h/día, 2-3 ocupadas por cada profesional.");

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

updateData();
