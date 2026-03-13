import { prisma } from "./lib/prisma";

async function test() {
    try {
        const result = await prisma.$queryRaw`DESCRIBE staff`;
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
