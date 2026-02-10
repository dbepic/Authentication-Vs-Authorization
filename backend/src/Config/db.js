import "dotenv/config.js";
import { PrismaClient } from "@prisma/client";
import logger from "../Utils/logger.js";

const prisma = new PrismaClient();


const connectDb = async () => {
    try {
        await prisma.$connect();
        logger.info("Database connected successfully :)");
    } catch (error) {
        logger.error("Database connection failed", error);
    }
}

export default connectDb;