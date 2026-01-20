"use server";

import { db } from "@/db";
import { psychologists, appointments, supportTickets, withdrawals, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPsychologistStatus(userId: string) {
    const psych = await db.query.psychologists.findFirst({
        where: eq(psychologists.userId, userId),
    });

    if (psych) return psych;

    // Self-healing: If user is a psychologist but has no profile, create it.
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    if (user && (user.role === 'psychologist' || user.role === 'admin')) {
        const [newPsych] = await db.insert(psychologists).values({
            userId: user.id,
            fullName: user.fullName || "Coach",
            email: user.email,
            specialty: "General",
            description: "Coach profesional en Pluravita.",
            price: "35.00",
            image: "",
            activePatients: 0,
            totalSessions: 0,
        }).returning();

        return newPsych;
    }

    return null;
}

export async function getPsychologists() {
    return await db.query.psychologists.findMany();
}

export async function getWithdrawals(psychologistId: string) {
    return await db.query.withdrawals.findMany({
        where: eq(withdrawals.psychologistId, psychologistId),
        orderBy: [desc(withdrawals.createdAt)],
    });
}

export async function updatePsychologistSettings(userId: string, data: {
    image?: string,
    tags?: string[],
    description?: string,
    iban?: string,
    payoutName?: string
}) {
    await db.update(psychologists)
        .set(data)
        .where(eq(psychologists.userId, userId));
    revalidatePath("/psychologist/dashboard");
    revalidatePath("/psychologist/balance");
}

export async function getUpcomingAppointments(psychologistId: string) {
    return await db.query.appointments.findMany({
        where: eq(appointments.psychologistId, psychologistId),
        with: {
            patient: true
        },
        orderBy: [desc(appointments.date)],
    });
}

export async function getPsychologistPatients(psychologistId: string) {
    // Get unique patients who have at least one appointment with this psychologist
    const psychologistAppointments = await db.query.appointments.findMany({
        where: eq(appointments.psychologistId, psychologistId),
        with: {
            patient: true
        }
    });

    const uniquePatientsMap = new Map();
    psychologistAppointments.forEach(app => {
        if (!uniquePatientsMap.has(app.patientId)) {
            uniquePatientsMap.set(app.patientId, {
                ...app.patient,
                lastSession: app.date,
                reason: app.reason,
                status: app.status === 'completed' ? 'Activo' : 'En pausa'
            });
        } else {
            // Update last session if this one is newer
            const existing = uniquePatientsMap.get(app.patientId);
            if (new Date(app.date) > new Date(existing.lastSession)) {
                uniquePatientsMap.set(app.patientId, {
                    ...existing,
                    lastSession: app.date,
                    reason: app.reason || existing.reason
                });
            }
        }
    });

    return Array.from(uniquePatientsMap.values());
}

export async function createSupportTicket(userId: string, subject: string, message: string) {
    await db.insert(supportTickets).values({
        userId,
        subject,
        message,
    });
    return { success: true };
}

export async function withdrawBalance(psychologistId: string, amount: number) {
    const psych = await db.query.psychologists.findFirst({
        where: eq(psychologists.id, psychologistId)
    });

    if (!psych || Number(psych.balance) < 50 || Number(psych.balance) < amount) {
        return { error: "Saldo insuficiente (mínimo 50€)" };
    }

    // Record the withdrawal request
    await db.insert(withdrawals).values({
        psychologistId,
        amount: amount.toString(),
        status: 'pending'
    });

    const newBalance = (Number(psych.balance) - amount).toString();
    await db.update(psychologists).set({ balance: newBalance }).where(eq(psychologists.id, psychologistId));

    revalidatePath("/psychologist/dashboard");
    revalidatePath("/psychologist/balance");
    return { success: true };
}
