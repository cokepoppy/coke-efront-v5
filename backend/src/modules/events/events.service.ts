import prisma from '../../database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';

export class EventsService {
  async getEvents(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    eventType?: string;
    category?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      page = 1,
      pageSize = 50,
      search,
      eventType,
      category,
      status,
      startDate,
      endDate,
    } = params;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) {
        where.startDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.startDate.lte = new Date(endDate);
      }
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { startDate: 'asc' },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return {
      data: events,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getEventById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!event || event.deletedAt) {
      throw new AppError(404, 'EVENT_NOT_FOUND', 'Event not found');
    }

    return event;
  }

  async createEvent(data: {
    title: string;
    description?: string;
    eventType?: string;
    category?: string;
    startDate: Date;
    endDate?: Date;
    location?: string;
    isAllDay?: boolean;
    color?: string;
    reminder?: number;
    relatedEntityType?: string;
    relatedEntityId?: string;
    attendees?: any;
    status?: string;
    createdBy?: string;
  }) {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        eventType: data.eventType,
        category: data.category,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        isAllDay: data.isAllDay ?? false,
        color: data.color,
        reminder: data.reminder,
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
        attendees: data.attendees,
        status: data.status as any,
        createdBy: data.createdBy,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return event;
  }

  async updateEvent(
    id: string,
    data: {
      title?: string;
      description?: string;
      eventType?: string;
      category?: string;
      startDate?: Date;
      endDate?: Date;
      location?: string;
      isAllDay?: boolean;
      color?: string;
      reminder?: number;
      attendees?: any;
      status?: string;
    }
  ) {
    const existing = await this.getEventById(id);

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.eventType !== undefined && { eventType: data.eventType }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.isAllDay !== undefined && { isAllDay: data.isAllDay }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.reminder !== undefined && { reminder: data.reminder }),
        ...(data.attendees !== undefined && { attendees: data.attendees }),
        ...(data.status !== undefined && { status: data.status as any }),
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return event;
  }

  async deleteEvent(id: string) {
    const existing = await this.getEventById(id);

    // Soft delete
    await prisma.event.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Event deleted successfully' };
  }

  async getUpcomingEvents(limit: number = 10) {
    const events = await prisma.event.findMany({
      where: {
        deletedAt: null,
        startDate: {
          gte: new Date(),
        },
        status: {
          not: 'cancelled',
        },
      },
      take: limit,
      orderBy: { startDate: 'asc' },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return events;
  }

  async getEventsByDateRange(startDate: Date, endDate: Date) {
    const events = await prisma.event.findMany({
      where: {
        deletedAt: null,
        OR: [
          {
            AND: [
              { startDate: { gte: startDate } },
              { startDate: { lte: endDate } },
            ],
          },
          {
            AND: [
              { endDate: { gte: startDate } },
              { endDate: { lte: endDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ],
      },
      orderBy: { startDate: 'asc' },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return events;
  }
}
