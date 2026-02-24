"use server";

import { client } from "@/db";
import { revalidatePath } from "next/cache";

export async function getBlogPosts() {
    try {
        const posts = await client`
            SELECT * FROM blog_posts 
            ORDER BY published_at DESC
        `;
        return posts;
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return [];
    }
}

export async function getBlogPostBySlug(slug: string) {
    try {
        const posts = await client`
            SELECT * FROM blog_posts 
            WHERE slug = ${slug}
            LIMIT 1
        `;
        return posts[0] || null;
    } catch (error) {
        console.error("Error fetching blog post by slug:", error);
        return null;
    }
}

export async function createBlogPost(data: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    image?: string;
    category?: string;
    author?: string;
}) {
    try {
        await client`
            INSERT INTO blog_posts (
                title, slug, content, excerpt, image, category, author
            ) VALUES (
                ${data.title}, ${data.slug}, ${data.content}, 
                ${data.excerpt || null}, ${data.image || null}, 
                ${data.category || 'General'}, ${data.author || 'Pluravita Team'}
            )
        `;
        revalidatePath("/blog");
        return { success: true };
    } catch (error) {
        console.error("Error creating blog post:", error);
        return { success: false, error: "No se pudo crear el artículo." };
    }
}

export async function seedInitialBlogs() {
    const blogs = [
        {
            title: "Yoga para la ansiedad: Una guía profunda hacia el equilibrio emocional",
            slug: "yoga-para-la-ansiedad",
            excerpt: "Descubre cómo el yoga se ha consolidado como una de las herramientas más potentes y accesibles para gestionar la ansiedad en el mundo moderno mediante la regulación del sistema nervioso.",
            category: "Bienestar",
            image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop",
            content: `
### El yoga como camino hacia la calma interior

El yoga se ha consolidado como una de las herramientas más potentes y accesibles para gestionar la ansiedad en el mundo moderno. No se trata simplemente de realizar contorsiones físicas, sino de un sistema integral que une el movimiento, la respiración y la atención plena para regular el sistema nervioso de manera efectiva.

### La ciencia detrás del yoga y el sistema nervioso

Cuando experimentamos ansiedad, nuestro sistema nervioso simpático entra en un estado de lucha o huida. Esto eleva los niveles de cortisol y nos mantiene en una alerta constante que agota nuestras reservas de energía. La práctica constante de yoga activa el sistema nervioso parasimpático, encargado de la relajación y la recuperación profunda. Mediante la respiración controlada y posturas específicas, enviamos una señal directa al cerebro de que estamos a salvo, permitiendo que la mente se serene.

### Técnicas de respiración para el alivio inmediato

1. Respiración Abdominal Profunda: Coloca una mano en tu pecho y otra en tu abdomen. Al inhalar, permite que tu mano abdominal suba mientras el pecho permanece lo más quieto posible. Esta técnica simple pero poderosa activa el nervio vago de forma inmediata y reduce las pulsaciones.

2. El ciclo de la calma (4-7-8): Inhala suavemente contando hasta cuatro, retén el aire durante siete segundos y exhala ruidosamente por la boca durante ocho segundos. Este ejercicio actúa como un interruptor de apagado para el ruido mental incesante.

### Posturas de restauración y seguridad

La Postura del Niño (Balasana): Esta posición replegada sobre uno mismo ofrece una sensación de seguridad psicológica inmediata. Al apoyar la frente en la esterilla, reducimos los estímulos externos y nos reconectamos con nuestro interior en un espacio de silencio.

El Efecto de la Constancia: No es necesario practicar una hora al día para ver resultados. Diez minutos de atención plena y estiramientos conscientes pueden cambiar la química de tu cerebro a largo plazo, fortaleciendo tu resiliencia ante los retos inesperados de la vida diaria.
            `.trim()
        },
        {
            title: "Estableciendo propósitos realistas: El arte del bienestar sostenible",
            slug: "propositos-realistas-salud-mental",
            excerpt: "Aprende a establecer metas que no sobrecarguen tu mente y te permitan crecer de forma sostenible, evitando el ciclo de frustración y ansiedad por objetivos inalcanzables.",
            category: "Crecimiento",
            image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2000&auto=format&fit=crop",
            content: `
### El arte de la progresión sostenible

A menudo, el inicio de un nuevo ciclo genera una presión desmedida por transformarnos por completo en tiempo récord. Esta mentalidad de todo o nada es, paradójicamente, una de las mayores causas de estrés y abandono prematuro. Aprender a establecer metas realistas no es falta de ambición, sino una estrategia inteligente para alcanzar el éxito a largo plazo sin sacrificar tu salud mental.

### El peligro de las metas sobredimensionadas

Cuando nos proponemos objetivos inalcanzables, nuestro cerebro interpreta el fallo inevitable como una amenaza a nuestra identidad y capacidad. Esto genera un ciclo de frustración que daña nuestra autoestima y nos aleja de nuestros verdaderos deseos. La clave del bienestar reside en la micro-progresión: realizar cambios tan pequeños y manejables que sea prácticamente imposible no cumplirlos cada día.

### Estrategias para implementar metas saludables

1. Define la acción específica: En lugar de proponerte conceptos vagos como ser más feliz, define una acción concreta y medible, como dedicar diez minutos cada tarde a caminar al aire libre sin distracciones digitales.

2. El factor de la realidad cotidiana: Evalúa tu energía y tiempo actuales antes de añadir una nueva responsabilidad a tu lista de tareas. Es mucho más beneficioso cumplir un solo propósito pequeño de forma constante que fallar en cinco grandes objetivos por falta de tiempo.

3. La flexibilidad como fortaleza psicológica: La vida es impredecible por naturaleza. Un sistema de propósitos saludable debe permitir ajustes y pausas sin que eso signifique un abandono total del proceso de crecimiento.

La salud mental no debería ser una meta más en tu lista de tareas pendientes, sino el fundamento sólido sobre el cual construyes todo lo demás. Priorizar el descanso, la desconexión y la autocompasión es el primer paso esencial para cualquier cambio real y duradero en tu vida.
            `.trim()
        },
        {
            title: "Terapia online: Ventajas y eficacia en la era digital",
            slug: "beneficios-terapia-online",
            excerpt: "La terapia desde casa ha roto barreras de tiempo y espacio, ofreciendo un entorno seguro y flexible que potencia la alianza terapéutica y el compromiso personal.",
            category: "Terapia",
            image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2000&auto=format&fit=crop",
            content: `
### La evolución de la salud mental digital

La digitalización de la salud mental ha dejado de ser una alternativa secundaria para convertirse en la opción preferida de millones de personas en todo el mundo. La terapia online ofrece una flexibilidad y accesibilidad que la modalidad presencial difícilmente puede igualar, manteniendo exactamente la misma eficacia clínica y rigor profesional.

### Ventajas fundamentales de la modalidad digital

Eliminación de barreras geográficas: Ya no estás limitado a los profesionales que se encuentran físicamente cerca de tu domicilio. Puedes elegir al especialista que mejor se adapte a tu necesidad específica o patología, incluso si se encuentra a miles de kilómetros de distancia.

Optimización del tiempo y logística: Integrar una sesión de terapia en una jornada laboral o familiar intensa es mucho más sencillo cuando no hay desplazamientos ni esperas involucrados. Esto reduce drásticamente una de las principales fricciones que suelen impedir que las personas den el primer paso en su proceso terapéutico.

### El poder de tu entorno seguro

Estar en tu propio hogar puede facilitar enormemente la apertura emocional necesaria para el éxito de la terapia. Sentirte en un espacio controlado, conocido y familiar reduce la ansiedad inicial que muchos pacientes experimentan al entrar en una consulta externa. La comodidad de tu propio sofá o el silencio respetuoso de tu habitación se convierten en aliados estratégicos de tu proceso de sanación personal.

### Evidencia científica de efectividad

Múltiples estudios internacionales de prestigio avalan que la alianza terapéutica, ese vínculo esencial de confianza entre paciente y profesional, es igual de fuerte y efectiva a través de la pantalla que en persona. Lo que realmente impulsa el cambio positivo es la calidad técnica de la intervención, la empatía del profesional y el compromiso mutuo con el crecimiento personal continuo.
            `.trim()
        }
    ];

    try {
        for (const blog of blogs) {
            // Check if exists
            const existing = await client`SELECT id FROM blog_posts WHERE slug = ${blog.slug}`;
            if (existing.length === 0) {
                await createBlogPost(blog);
            } else {
                // Update existing to match new "developed" content
                await client`
                    UPDATE blog_posts 
                    SET title = ${blog.title}, 
                        content = ${blog.content}, 
                        excerpt = ${blog.excerpt},
                        image = ${blog.image},
                        category = ${blog.category}
                    WHERE slug = ${blog.slug}
                `;
            }
        }
        revalidatePath("/blog");
        return { success: true };
    } catch (error) {
        console.error("Error seeding blogs:", error);
        return { success: false };
    }
}
