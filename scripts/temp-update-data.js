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
            const allSlots = [];

            // Generar 4 slots por día durante 7 días
            for (let i = 0; i < 7; i++) {
                const day = new Date(now);
                day.setDate(now.getDate() + i);
                day.setHours(0, 0, 0, 0);

                const hours = [10, 11, 16, 17];
                for (const h of hours) {
                    const startTime = new Date(day);
                    startTime.setHours(h, 0, 0, 0);

                    const endTime = new Date(startTime);
                    endTime.setHours(h + 1, 0, 0, 0);

                    allSlots.push({
                        startTime: startTime.toISOString(),
                        endTime: endTime.toISOString()
                    });
                }
            }

            // Seleccionar 3-5 aleatorios para marcar como ocupados
            const numToBook = Math.floor(Math.random() * 3) + 3; // 3, 4 o 5
            const shuffledIndices = [...Array(allSlots.length).keys()].sort(() => 0.5 - Math.random());
            const bookedIndices = new Set(shuffledIndices.slice(0, numToBook));

            for (let idx = 0; idx < allSlots.length; idx++) {
                const slot = allSlots[idx];
                const isBooked = bookedIndices.has(idx);

                await sql`INSERT INTO availability_slots (oyente_id, start_time, end_time, is_booked) 
                          VALUES (${oyenteId}, ${slot.startTime}, ${slot.endTime}, ${isBooked})`;
            }
        }
        console.log("✅ Disponibilidad actualizada: 4h/día, 3-5 ocupadas POR SEMANA.");

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

updateData();
