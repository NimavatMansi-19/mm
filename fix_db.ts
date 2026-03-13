import { prisma } from "./lib/prisma";

async function fix() {
    console.log("Starting manual schema fix...");
    try {
        console.log("Checking if profilePic exists in staff...");
        const staffCols: any = await prisma.$queryRaw`SHOW COLUMNS FROM staff LIKE 'profilePic'`;
        if (staffCols.length === 0) {
            console.log("Adding profilePic to staff table...");
            await prisma.$executeRawUnsafe("ALTER TABLE staff ADD COLUMN profilePic TEXT");
            console.log("Added profilePic to staff.");
        } else {
            console.log("profilePic already exists in staff.");
        }

        console.log("Checking if profilePic exists in users...");
        const usersCols: any = await prisma.$queryRaw`SHOW COLUMNS FROM users LIKE 'profilePic'`;
        if (usersCols.length === 0) {
            console.log("Adding profilePic to users table...");
            await prisma.$executeRawUnsafe("ALTER TABLE users ADD COLUMN profilePic TEXT");
            console.log("Added profilePic to users.");
        } else {
            console.log("profilePic already exists in users.");
        }

        console.log("Schema fix completed successfully.");
    } catch (e) {
        console.error("Schema fix failed:", e);
    } finally {
        process.exit(0);
    }
}

fix();
