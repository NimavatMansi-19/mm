import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../app/generated/prisma/client";


const prismaClientSingleton = () => {
    console.log("Initializing Prisma with:", {
        host: process.env.DB_HOST || "missing",
        database: process.env.DB_NAME || "missing",
        user: process.env.DB_USER || "missing",
        port: process.env.DB_PORT || "missing"
    });
    
    try {
        const adapter = new PrismaMariaDb({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            port: Number(process.env.DB_PORT),
            database: process.env.DB_NAME,
            connectionLimit: 10, // Lowering limit for serverless/local dev stability
            connectTimeout: 5000,
        });
        return new PrismaClient({ 
            adapter,
            log: ['error', 'warn']
        });
    } catch (error) {
        console.error("Prisma initialization failed:", error);
        return new PrismaClient({}); // Fallback to standard client config
    }
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
