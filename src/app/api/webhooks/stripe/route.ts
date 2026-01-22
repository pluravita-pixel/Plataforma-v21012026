import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { client } from "@/db";
import { confirmAppointmentPayment } from "@/app/actions/booking";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-12-18.acacia" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    const stripe = getStripe();
    const body = await req.text();
    const sig = (await headers()).get("stripe-signature");

    let event: Stripe.Event;

    try {
        // BYPASS FOR LOCAL TESTING WITHOUT CLI
        if (process.env.NODE_ENV === 'development' && req.headers.get('x-mock-stripe-webhook') === 'true') {
            console.warn("⚠️ MOCKING STRIPE WEBHOOK - SKIPPING SIGNATURE VERIFICATION");
            event = JSON.parse(body);
        } else {
            // STANDARD PRODUCTION VERIFICATION
            if (!sig || !webhookSecret) {
                console.error("Missing signature or webhook secret");
                return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
            }
            event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
        }
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const appointmentId = session.metadata?.appointmentId;

        if (appointmentId) {
            console.log(`Payment confirmed for appointment: ${appointmentId}`);

            // 1. Update status in database
            await client`
                UPDATE appointments 
                SET payment_status = 'paid', 
                    status = 'scheduled'
                WHERE id = ${appointmentId}
            `;

            // 2. Trigger the existing confirmation logic (stats refresh, etc.)
            await confirmAppointmentPayment(appointmentId);
        }
    }

    return NextResponse.json({ received: true });
}
