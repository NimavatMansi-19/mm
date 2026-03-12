import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";


export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(Buffer.from(base64, 'base64').toString());

        // Ensure StaffID is in payload if available
        if (!payload.StaffID && payload.id) {
            payload.StaffID = payload.id;
        }

        // Only query DB if we absolutely need to verify or sync
        if (payload.email && !payload.StaffID) {
            try {
                const staff = await prisma.staff.findFirst({
                    where: { EmailAddress: payload.email }
                });
                if (staff) {
                    payload.StaffID = staff.StaffID;
                }
            } catch (dbError) {
                console.warn("Could not fetch staff from DB, using token payload only:", dbError);
            }
        }

        return payload;
    } catch (e) {
        console.error("Token decoding failed:", e);
        return null;
    }
}

export async function requireUser() {
    const session = await getCurrentUser();
    if (!session) {
        redirect("/login");
    }
    return session;
}
