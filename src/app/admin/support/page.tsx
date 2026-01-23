export const dynamic = 'force-dynamic';
import { getAllTickets } from "@/app/actions/support";
import { SupportClient } from "./SupportClient";

export default async function AdminSupportPage() {
    const tickets = await getAllTickets();

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <SupportClient tickets={tickets} />
        </div>
    );
}
