import express, { Express } from 'express';
import cors from 'cors';
import router from './routes';

const app: Express = express();

// Middleware - CORS configurado para permitir credenciais e origem do frontend
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5000';
app.use(
	cors({
		origin: allowedOrigin,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization']
	})
);

// Middleware especial para webhook do Stripe (precisa de raw body)
app.use('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }));

// Middleware padrão para outras rotas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', router);

export default app;
