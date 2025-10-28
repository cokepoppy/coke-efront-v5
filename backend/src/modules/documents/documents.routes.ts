import { Router } from 'express';
import { DocumentsController } from './documents.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new DocumentsController();

// All routes require authentication
router.use(authenticate);

router.get('/', controller.getDocuments);
router.get('/stats', controller.getDocumentStats);
router.get('/:id', controller.getDocumentById);
router.post('/', controller.createDocument);
router.put('/:id', controller.updateDocument);
router.delete('/:id', controller.deleteDocument);

export default router;
