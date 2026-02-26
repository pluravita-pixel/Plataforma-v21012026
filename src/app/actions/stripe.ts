"use server";

import Stripe from "stripe";
import { client } from "@/db";
import { headers } from "next/headers";

const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not defined");
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2024-12-18.acacia" as any,
    });
};

export async function createCheckoutSession(appointmentId: string, returnUrl?: string) {
    try {
        const stripe = getStripe();

        // Detect base URL dynamically from headers
        const host = (await headers()).get("host");
        const protocol = host?.includes("localhost") ? "http" : "https";
        const base = `${protocol}://${host}`;

        const finalReturnUrl = returnUrl || `${base}/usuario/dashboard`;

        const apptResults = await client`
            SELECT a.*, p.full_name as oyente_name 
            FROM appointments a
            JOIN oyentes p ON a.oyente_id = p.id
            WHERE a.id = ${appointmentId}
            LIMIT 1
        `;
        const appointment = apptResults[0];

        if (!appointment) throw new Error("Cita no encontrada");

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: `Sesión con ${appointment.oyente_name}`,
                            description: `Cita reservada para el ${new Date(appointment.date).toLocaleString('es-ES')}`,
                        },
                        unit_amount: Math.round(Number(appointment.price || 0) * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${finalReturnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${finalReturnUrl}?canceled=true&appt=${appointmentId}`,
            metadata: {
                appointmentId: appointment.id,
            },
        });

        await client`
            UPDATE appointments 
            SET stripe_session_id = ${session.id}
            WHERE id = ${appointmentId}
        `;

        // 🚨 MVP NOTIFICATION: Detectar intentos de compra en perfiles de prueba
        const oyenteEmail = await client`
            SELECT email FROM oyentes WHERE id = ${appointment.oyente_id} LIMIT 1
        `;

        if (oyenteEmail[0]?.email?.includes('.mvp@pluravita.test')) {
            console.log('\n🔔 ═══════════════════════════════════════════════════════');
            console.log('🎯 ALERTA MVP: ¡Alguien ha intentado comprar una sesión!');
            console.log('═══════════════════════════════════════════════════════');
            console.log(`👤 Oyente: ${appointment.oyente_name}`);
            console.log(`💰 Precio: ${appointment.price}€ (IVA incluido)`);
            console.log(`📅 Fecha: ${new Date(appointment.date).toLocaleString('es-ES')}`);
            console.log(`📧 Usuario: ${appointment.usuario_nombre || 'Anónimo'}`);
            console.log(`🆔 ID Cita: ${appointmentId}`);
            console.log(`🔗 Session Stripe: ${session.id}`);
            console.log('═══════════════════════════════════════════════════════\n');

            // TODO: Aquí puedes añadir envío de email, webhook, o notificación push
            // Por ahora solo se registra en los logs del servidor
        }

        return { url: session.url };
    } catch (error: any) {
        console.error("Error creating stripe session:", error);
        return { error: error.message };
    }
}
