import { Request, Response, NextFunction } from 'express';
import { EventsService } from './events.service';
import { ResponseUtil } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

export class EventsController {
  private eventsService: EventsService;

  constructor() {
    this.eventsService = new EventsService();
  }

  getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page,
        pageSize,
        search,
        eventType,
        category,
        status,
        startDate,
        endDate,
      } = req.query;

      const result = await this.eventsService.getEvents({
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
        search: search as string,
        eventType: eventType as string,
        category: category as string,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      ResponseUtil.paginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  };

  getEventById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const event = await this.eventsService.getEventById(id);
      ResponseUtil.success(res, event);
    } catch (error) {
      next(error);
    }
  };

  createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        description,
        eventType,
        category,
        startDate,
        endDate,
        location,
        isAllDay,
        color,
        reminder,
        relatedEntityType,
        relatedEntityId,
        attendees,
        status,
      } = req.body;

      const event = await this.eventsService.createEvent({
        title,
        description,
        eventType,
        category,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        location,
        isAllDay,
        color,
        reminder,
        relatedEntityType,
        relatedEntityId,
        attendees,
        status,
        createdBy: req.user?.id,
      });

      ResponseUtil.success(res, event, 'Event created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        eventType,
        category,
        startDate,
        endDate,
        location,
        isAllDay,
        color,
        reminder,
        attendees,
        status,
      } = req.body;

      const event = await this.eventsService.updateEvent(id, {
        title,
        description,
        eventType,
        category,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        location,
        isAllDay,
        color,
        reminder,
        attendees,
        status,
      });

      ResponseUtil.success(res, event, 'Event updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.eventsService.deleteEvent(id);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getUpcomingEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit } = req.query;
      const events = await this.eventsService.getUpcomingEvents(
        limit ? parseInt(limit as string) : undefined
      );
      ResponseUtil.success(res, events);
    } catch (error) {
      next(error);
    }
  };

  getEventsByDateRange = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new Error('startDate and endDate are required');
      }

      const events = await this.eventsService.getEventsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      ResponseUtil.success(res, events);
    } catch (error) {
      next(error);
    }
  };
}
