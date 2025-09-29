import express, { Express } from 'express';
import cors from 'cors';
import router from './routes';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', router);

export default app;
