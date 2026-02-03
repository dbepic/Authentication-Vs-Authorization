import pkg from "@prisma/client";

const { PrismaClient } = pkg;

const prisma = new PrismaClient({
    log: ["query", "error"],
});

export default prisma;
