
import { client } from "@/db";
import { redirect } from "next/navigation";

export async function GET(request: Request, { params }: { params: { code: string } }) {
    const { code } = params;

    if (!code) {
        redirect("/patient/search");
    }

    try {
        const results = await client`
            SELECT id FROM psychologists WHERE ref_code = ${code} LIMIT 1
        `;

        if (results.length > 0) {
            redirect(`/patient/search?ref=${results[0].id}`);
        } else {
            redirect("/patient/search");
        }
    } catch (error) {
        console.error("Error looking up ref code:", error);
        redirect("/patient/search");
    }
}
