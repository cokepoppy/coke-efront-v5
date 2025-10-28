import prisma from '../../database/prisma';
import { AppError } from '../../shared/middleware/error.middleware';

export class DocumentsService {
  async getDocuments(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    documentType?: string;
    category?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }) {
    const {
      page = 1,
      pageSize = 20,
      search,
      documentType,
      category,
      relatedEntityType,
      relatedEntityId,
    } = params;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.name = {
        contains: search,
      };
    }

    if (documentType) {
      where.documentType = documentType;
    }

    if (category) {
      where.category = category;
    }

    if (relatedEntityType) {
      where.relatedEntityType = relatedEntityType;
    }

    if (relatedEntityId) {
      where.relatedEntityId = relatedEntityId;
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { uploadedAt: 'desc' },
      }),
      prisma.document.count({ where }),
    ]);

    return {
      data: documents,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getDocumentById(id: string) {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document || document.deletedAt) {
      throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Document not found');
    }

    return document;
  }

  async createDocument(data: {
    name: string;
    documentType?: string;
    category?: string;
    fileUrl: string;
    fileSize?: number;
    mimeType?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    tags?: any;
    isPublic?: boolean;
    uploadedBy?: string;
  }) {
    const document = await prisma.document.create({
      data: {
        name: data.name,
        documentType: data.documentType,
        category: data.category,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize ? BigInt(data.fileSize) : null,
        mimeType: data.mimeType,
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
        tags: data.tags,
        isPublic: data.isPublic ?? false,
        uploadedBy: data.uploadedBy,
      },
    });

    return document;
  }

  async updateDocument(
    id: string,
    data: {
      name?: string;
      documentType?: string;
      category?: string;
      tags?: any;
      isPublic?: boolean;
    }
  ) {
    const existing = await this.getDocumentById(id);

    const document = await prisma.document.update({
      where: { id },
      data,
    });

    return document;
  }

  async deleteDocument(id: string) {
    const existing = await this.getDocumentById(id);

    // Soft delete
    await prisma.document.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Document deleted successfully' };
  }

  async getDocumentStats() {
    const [total, byType, byCategory, recentUploads] = await Promise.all([
      prisma.document.count({
        where: { deletedAt: null },
      }),
      prisma.document.groupBy({
        by: ['documentType'],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.document.groupBy({
        by: ['category'],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.document.findMany({
        where: { deletedAt: null },
        orderBy: { uploadedAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      total,
      byType,
      byCategory,
      recentUploads,
    };
  }
}
