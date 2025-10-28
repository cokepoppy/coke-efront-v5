import { Router } from 'express';
import { EventsController } from './events.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new EventsController();

// All routes require authentication
router.use(authenticate);

router.get('/', controller.getEvents);
router.get('/upcoming', controller.getUpcomingEvents);
router.get('/by-date-range', controller.getEventsByDateRange);
router.get('/:id', controller.getEventById);
router.post('/', controller.createEvent);
router.put('/:id', controller.updateEvent);
router.delete('/:id', controller.deleteEvent);

export default router;
