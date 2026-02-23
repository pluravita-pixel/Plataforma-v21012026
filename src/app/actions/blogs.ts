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
            title: "Yoga para la ansiedad: 10 posturas y técnicas que funcionan",
            slug: "yoga-para-la-ansiedad",
            excerpt: "Descubre cómo el yoga puede ser tu mejor aliado para calmar la mente y equilibrar tu sistema nervioso con estas técnicas sencillas.",
            category: "Bienestar",
            image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop",
            content: `
# Yoga para la ansiedad: Un camino hacia la calma

El yoga es mucho más que posturas físicas; es una integración de movimiento, respiración y atención plena que ayuda a calmar la mente y equilibrar el cuerpo. En este artículo, exploramos técnicas accesibles para reducir el estrés.

## Técnicas de respiración (Pranayama)

1. **Respiración diafragmática:** Inhala llevando el aire al abdomen, permitiendo que se expanda. Esto activa el nervio vago y calma el sistema nervioso.
2. **Técnica 4-7-8:** Inhala en 4 segundos, sostén por 7 y exhala en 8. Es ideal para momentos de crisis.

## Posturas recomendadas

*   **Balasana (Postura del niño):** Una postura restauradora que libera tensión en la espalda y calma el cerebro.
*   **Savasana:** La relajación final, esencial para integrar los beneficios de la práctica.

Practicar yoga regularmente no solo mejora la flexibilidad, sino que entrena a tu mente para mantenerse presente, reduciendo significativamente los niveles de cortisol.
            `.trim()
        },
        {
            title: "Propósitos realistas: Cómo cuidar tu salud mental este año",
            slug: "propositos-realistas-salud-mental",
            excerpt: "Aprende a establecer metas que no sobrecarguen tu mente y te permitan crecer de forma sostenible y saludable.",
            category: "Crecimiento",
            image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2000&auto=format&fit=crop",
            content: `
# Propósitos realistas y salud mental

El inicio de un nuevo año suele traer una lista interminable de metas. Sin embargo, cuando estas son inalcanzables, se convierten en una fuente de ansiedad.

## El método SMART para tu bienestar

Para que un propósito sea saludable, debe ser:
*   **Específico:** No digas "quiero ser feliz", di "voy a dedicar 15 minutos al día a leer".
*   **Medible:** Puedes llevar un registro de tus avances.
*   **Alcanzable:** Sé honesto con tu tiempo y energía actual.

## Priorizando la salud mental

A veces, el mejor propósito es aprender a decir "no" o Priorizar el descanso. La terapia es una herramienta fundamental para entender qué es lo que realmente necesitas fortalecer en tu vida.
            `.trim()
        },
        {
            title: "Beneficios de la terapia online en la era digital",
            slug: "beneficios-terapia-online",
            excerpt: "La terapia desde casa ha roto barreras de tiempo y espacio. Descubre por qué es tan efectiva como la presencial.",
            category: "Terapia",
            image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2000&auto=format&fit=crop",
            content: `
# ¿Por qué elegir la terapia online?

La psicología ha evolucionado, y hoy en día, recibir apoyo profesional es más fácil que nunca gracias a la tecnología.

## Ventajas principales

1. **Accesibilidad:** Puedes hablar con el mejor psicólogo para ti, sin importar si vive en otra ciudad o país.
2. **Flexibilidad:** Ahorras tiempo en desplazamientos, integrando la sesión fácilmente en tu agenda diaria.
3. **Comodidad:** Estar en tu propio espacio suele facilitar la apertura emocional.

## Efectividad comprobada

Múltiples estudios demuestran que la alianza terapéutica que se forma online es tan sólida como la presencial. Lo más importante es la conexión con el profesional y el compromiso con el proceso.
            `.trim()
        }
    ];

    try {
        for (const blog of blogs) {
            // Check if exists
            const existing = await client`SELECT id FROM blog_posts WHERE slug = ${blog.slug}`;
            if (existing.length === 0) {
                await createBlogPost(blog);
            }
        }
        return { success: true };
    } catch (error) {
        console.error("Error seeding blogs:", error);
        return { success: false };
    }
}
