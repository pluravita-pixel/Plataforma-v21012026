"use server";

import Stripe from "stripe";
import { client } from "@/db";

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
        const base = process.env.NEXT_PUBLIC_APP_URL || "";
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

        return { url: session.url };
    } catch (error: any) {
        console.error("Error creating stripe session:", error);
        return { error: error.message };
    }
}
