import { client } from "../src/db";

async function seedFakeOyentes() {
    console.log("🌱 Creando perfiles falsos de oyentes para MVP...");

    // Primero, crear usuarios base
    const fakeOyentes = [
        {
            email: "maria.lopez.mvp@pluravita.test",
            fullName: "María López García",
            specialty: "Ansiedad y Estrés",
            price: "15.00",
            description: "Especialista en gestión de ansiedad y técnicas de relajación. Te ayudo a encontrar la calma en momentos difíciles con un enfoque práctico y cercano.",
            languages: ["Español", "Catalán"],
            tags: ["Ansiedad", "Estrés", "Mindfulness"],
            studies: "Máster en Psicología Clínica - Universidad de Barcelona",
            benefits: [
                "Más de 5 años de experiencia en terapia online",
                "Enfoque práctico y orientado a resultados",
                "Sesiones adaptadas a tu ritmo"
            ],
            experience: "He trabajado con más de 200 personas ayudándolas a superar la ansiedad y recuperar el control de sus vidas.",
            // Imagen proporcionada por el usuario
            image: "artifact:/oyente_profile_2_1739496204"
        },
        {
            email: "carlos.martinez.mvp@pluravita.test",
            fullName: "Carlos Martínez Ruiz",
            specialty: "Relaciones y Autoestima",
            price: "20.00",
            description: "Te acompaño en tu proceso de crecimiento personal y mejora de relaciones. Juntos trabajaremos en fortalecer tu autoestima y confianza.",
            languages: ["Español", "Inglés"],
            tags: ["Autoestima", "Relaciones", "Confianza"],
            studies: "Licenciado en Psicología - Universidad Complutense de Madrid",
            benefits: [
                "Enfoque empático y sin juicios",
                "Herramientas prácticas desde la primera sesión",
                "Disponibilidad flexible de horarios"
            ],
            experience: "Llevo 7 años ayudando a personas a construir relaciones más sanas y a desarrollar una autoestima sólida.",
            image: "artifact:/oyente_profile_1_1739496204"
        },
        {
            email: "laura.fernandez.mvp@pluravita.test",
            fullName: "Laura Fernández Sánchez",
            specialty: "Bienestar Emocional",
            price: "35.00",
            description: "Con más de 10 años de experiencia, te ofrezco un espacio seguro para explorar tus emociones y encontrar el equilibrio que buscas.",
            languages: ["Español", "Francés", "Inglés"],
            tags: ["Bienestar", "Emociones", "Terapia Cognitiva"],
            studies: "Doctora en Psicología Clínica - Universidad Autónoma de Madrid",
            benefits: [
                "Más de 10 años de experiencia profesional",
                "Formación en terapias de tercera generación",
                "Enfoque integral y personalizado",
                "Seguimiento continuo entre sesiones"
            ],
            experience: "He acompañado a más de 500 personas en su camino hacia el bienestar emocional, combinando técnicas tradicionales con enfoques innovadores.",
            image: "artifact:/oyente_profile_4_1739496204"
        }
    ];

    try {
        for (const oyente of fakeOyentes) {
            console.log(`\n📝 Creando: ${oyente.fullName}...`);

            // 1. Crear o verificar usuario
            let userId: string;
            const existingUser = await client`
                SELECT id FROM users WHERE email = ${oyente.email} LIMIT 1
            `;

            if (existingUser.length > 0) {
                userId = existingUser[0].id;
                console.log(`   ✓ Usuario ya existe: ${userId}`);
            } else {
                const newUser = await client`
                    INSERT INTO users (email, full_name, role)
                    VALUES (${oyente.email}, ${oyente.fullName}, 'oyente')
                    RETURNING id
                `;
                userId = newUser[0].id;
                console.log(`   ✓ Usuario creado: ${userId}`);
            }

            // 2. Crear o actualizar perfil de oyente
            const existingOyente = await client`
                SELECT id FROM oyentes WHERE user_id = ${userId} LIMIT 1
            `;

            if (existingOyente.length > 0) {
                await client`
                    UPDATE oyentes
                    SET 
                        full_name = ${oyente.fullName},
                        specialty = ${oyente.specialty},
                        price = ${oyente.price},
                        description = ${oyente.description},
                        languages = ${oyente.languages},
                        tags = ${oyente.tags},
                        studies = ${oyente.studies},
                        benefits = ${oyente.benefits},
                        experience = ${oyente.experience},
                        image = ${oyente.image}
                    WHERE user_id = ${userId}
                `;
                console.log(`   ✓ Perfil actualizado`);
            } else {
                await client`
                    INSERT INTO oyentes (
                        user_id, full_name, email, specialty, price, description,
                        languages, tags, studies, benefits, experience, image,
                        total_sessions, completed_sessions, active_usuarios, total_usuarios, rating
                    )
                    VALUES (
                        ${userId}, ${oyente.fullName}, ${oyente.email}, ${oyente.specialty},
                        ${oyente.price}, ${oyente.description}, ${oyente.languages},
                        ${oyente.tags}, ${oyente.studies}, ${oyente.benefits},
                        ${oyente.experience}, ${oyente.image},
                        0, 0, 0, 0, '5.0'
                    )
                `;
                console.log(`   ✓ Perfil de oyente creado`);
            }

            // 3. Crear horarios de disponibilidad (próximos 7 días)
            const oyenteId = await client`SELECT id FROM oyentes WHERE user_id = ${userId} LIMIT 1`;
            const oyenteDbId = oyenteId[0].id;

            // Limpiar slots antiguos
            await client`DELETE FROM availability_slots WHERE oyente_id = ${oyenteDbId}`;

            // Crear slots para los próximos 7 días
            const slotsToCreate = [];
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

                    slotsToCreate.push({
                        oyente_id: oyenteDbId,
                        start_time: startTime.toISOString(),
                        end_time: endTime.toISOString(),
                        is_booked: false
                    });
                }
            }

            // Insertar todos los slots
            for (const slot of slotsToCreate) {
                await client`
                    INSERT INTO availability_slots (oyente_id, start_time, end_time, is_booked)
                    VALUES (${slot.oyente_id}, ${slot.start_time}, ${slot.end_time}, ${slot.is_booked})
                `;
            }

            console.log(`   ✓ ${slotsToCreate.length} horarios creados`);
        }

        console.log("\n✅ ¡Perfiles falsos creados exitosamente!");
        console.log("\n📸 IMPORTANTE: Reemplaza las URLs de las imágenes con fotos reales:");
        console.log("   1. Descarga fotos de perfil profesionales de Unsplash o similar");
        console.log("   2. Súbelas a tu proyecto en /public/images/oyentes/");
        console.log("   3. Actualiza las URLs en la base de datos o vuelve a ejecutar este script");

    } catch (error) {
        console.error("❌ Error creando perfiles:", error);
        throw error;
    } finally {
        await client.end();
    }
}

seedFakeOyentes();
