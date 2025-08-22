import express, { Express } from 'express';
import cors from 'cors';
import { setRoutes } from './routes';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
setRoutes(app);

export default app;