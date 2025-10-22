import express, { Express } from 'express';
import cors from 'cors';
import router from './routes';

const app: Express = express();

// Middleware
app.use(cors());

// Middleware especial para webhook do Stripe (precisa de raw body)
app.use('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }));

// Middleware padrão para outras rotas
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', router);

export default app;
