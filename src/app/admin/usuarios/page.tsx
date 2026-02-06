import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { UsersListClient } from "./UsersListClient";
import { client } from "@/db";

export default async function AdminUsersPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
        redirect("/login");
    }

    // Fetch all users with their affinity test results
    const users = await client`
        SELECT 
            u.id,
            u.email,
            u.full_name,
            u.phone,
            u.role,
            u.sessions_count,
            u.has_completed_affinity,
            u.created_at,
            u.last_login,
            a.id as affinity_id,
            a.responses,
            a.created_at as affinity_date
        FROM users u
        LEFT JOIN affinity_tests a ON u.id = a.user_id
        ORDER BY u.created_at DESC
    `;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Usuarios Registrados</h1>
                <p className="text-gray-500 mt-1">Gestiona y visualiza todos los usuarios de la plataforma</p>
            </div>

            <UsersListClient users={[...users] as any} />
        </div>
    );
}
