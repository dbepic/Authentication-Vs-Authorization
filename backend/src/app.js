import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import logger from './Utils/logger.js'
import helmet from "helmet";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.get('/', (req, res) => {
    logger.info(`testing in app function`)
})


export default app;