import app from "./app.js";
import "dotenv/config.js"
import logger from "./Utils/logger.js";
import connectDb from "./Config/db.js";

const PORT = process.env.PORT;

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    connectDb();
});