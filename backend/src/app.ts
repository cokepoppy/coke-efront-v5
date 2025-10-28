import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler, notFoundHandler } from './shared/middleware/error.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import fundsRoutes from './modules/funds/funds.routes';
import investmentsRoutes from './modules/investments/investments.routes';
import investorsRoutes from './modules/investors/investors.routes';
import capitalCallsRoutes from './modules/capital/capital-calls.routes';
import valuationsRoutes from './modules/investments/valuations.routes';
import documentsRoutes from './modules/documents/documents.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/funds', fundsRoutes);
apiRouter.use('/investments', investmentsRoutes);
apiRouter.use('/investors', investorsRoutes);
apiRouter.use('/capital-calls', capitalCallsRoutes);
apiRouter.use('/valuations', valuationsRoutes);
apiRouter.use('/documents', documentsRoutes);

app.use(config.apiPrefix, apiRouter);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
