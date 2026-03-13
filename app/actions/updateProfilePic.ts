"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateProfilePic(imageData: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // The user ID could be from session.id (users table) or session.StaffID (staff table)
    // If it's a staff member, we update the staff table.
    // Otherwise, we update the users table.

    if (user.role === 'staff' && user.StaffID) {
        // Using raw SQL to bypass Prisma Client type checking if generate failed
        await prisma.$executeRaw`UPDATE staff SET profilePic = ${imageData} WHERE StaffID = ${Number(user.StaffID)}`;
    } else if (user.id) {
        await prisma.$executeRaw`UPDATE users SET profilePic = ${imageData} WHERE user_id = ${Number(user.id)}`;
        
        // Also check if this admin has a staff record linked by email and update it too for consistency
        const linkedStaff = await prisma.staff.findFirst({
            where: { EmailAddress: user.email }
        });
        if (linkedStaff) {
            await prisma.$executeRaw`UPDATE staff SET profilePic = ${imageData} WHERE StaffID = ${linkedStaff.StaffID}`;
        }
    }

    revalidatePath("/profile");
}
