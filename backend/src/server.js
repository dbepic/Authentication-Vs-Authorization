import "dotenv/config.js"
import app from "./app.js";

import logger from "./Utils/logger.js";


const port = process.env.PORT;

app.listen(port, () => {
    logger.info(`servering is listening on ${port}`)
})

