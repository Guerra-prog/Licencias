import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import catalogRoutes from './routes/catalog.routes';
import adminRoutes from './routes/admin.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import paymentRoutes from './routes/payment.routes';
import uploadRoutes from './routes/upload.routes';
import { webhook } from './controllers/payment.controller';
import { verifyEnrollment } from './controllers/enrollment.controller';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

// El webhook de Stripe necesita el body sin parsear para verificar la firma
app.post('/payments/webhook', express.raw({ type: 'application/json' }), webhook);

app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', servicio: 'CEA AMC API' }));

app.use('/auth', authRoutes);
app.use('/', catalogRoutes);
app.use('/admin', adminRoutes);
app.use('/enrollments', enrollmentRoutes);
app.use('/payments', paymentRoutes);
app.use('/uploads', uploadRoutes);
app.get('/verify/:codigoVerificacion', verifyEnrollment);

app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`🚗 CEA AMC API escuchando en el puerto ${env.port}`);
});

export default app;
