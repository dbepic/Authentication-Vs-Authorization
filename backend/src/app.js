import express from 'express'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import logger from './Utils/logger.js'

import authRoute from './Router/authRoute.js'
import userRoute from './Router/userRoute.js'

const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-Authorization']
}))


app.get('/', (req, res) => {
    logger.info('Server is running :)');
    res.send('Server is running :)');
})

app.use('/api', authRoute);
app.use('/api', userRoute);

export default app;