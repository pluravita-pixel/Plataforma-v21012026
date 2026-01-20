import { db } from "../db";
import { users, psychologists, supportTickets } from "../db/schema";
import { eq } from "drizzle-orm";

async function testMerge() {
    const testEmail = "test_invite_merge@example.com";
    const stubId = "00000000-0000-0000-0000-000000000001";
    const realId = "11111111-1111-1111-1111-111111111111";

    console.log("--- TEST: Non-Cascading Invitation Merge Logic ---");

    try {
        // 1. Cleanup
        await db.delete(users).where(eq(users.email, testEmail));
        console.log("1. Cleaned up previous test data.");

        // 2. Create stub (Admin invitation)
        await db.insert(users).values({
            id: stubId,
            email: testEmail,
            fullName: "Invite Pending",
            role: "psychologist"
        });

        await db.insert(psychologists).values({
            userId: stubId,
            fullName: "Invite Pending",
            email: testEmail,
            specialty: "Test Specialty"
        });
        console.log("2. Created stub user and psychologist profile (Invitation).");

        // 3. Simulate Merge
        console.log(`3. Simulating registration with new ID: ${realId}`);
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, testEmail),
        });

        if (existingUser && existingUser.id !== realId) {
            // STEP A: Insert New User record (since email is unique, we temporary move the old one)
            // Wait, Postgres doesn't allow two rows with same email even if we are merging.
            // So we MUST change the email of the stub first or delete it.

            console.log("   Updating stub email to allow new user insertion...");
            await db.update(users).set({ email: `old_${testEmail}` }).where(eq(users.id, stubId));

            console.log("   Inserting new user...");
            await db.insert(users).values({
                id: realId,
                email: testEmail,
                fullName: "Registered Name",
                role: existingUser.role,
            });

            console.log("   Moving psychologists to new ID...");
            await db.update(psychologists)
                .set({ userId: realId })
                .where(eq(psychologists.userId, stubId));

            console.log("   Deleting stub...");
            await db.delete(users).where(eq(users.id, stubId));

            console.log("   Merge completed.");
        }

        // 4. Verify
        const updatedUser = await db.query.users.findFirst({
            where: eq(users.email, testEmail),
        });

        const updatedPsych = await db.query.psychologists.findFirst({
            where: eq(psychologists.userId, realId),
        });

        console.log("4. Verification:");
        console.log(`   User ID is real ID? ${updatedUser?.id === realId}`);
        console.log(`   Psychologist linked to real ID? ${updatedPsych?.userId === realId}`);

        if (updatedUser?.id === realId && updatedPsych?.userId === realId) {
            console.log("--- SUCCESS: Non-cascading merge verified! ---");
        } else {
            console.log("--- FAILURE: Merge did not work. ---");
        }

    } catch (error) {
        console.error("--- ERROR during test: ---", error);
    } finally {
        process.exit();
    }
}

testMerge();
