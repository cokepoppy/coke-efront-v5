import { Request, Response, NextFunction } from 'express';
import { DocumentsService } from './documents.service';
import { ResponseUtil } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

export class DocumentsController {
  private documentsService: DocumentsService;

  constructor() {
    this.documentsService = new DocumentsService();
  }

  getDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page,
        pageSize,
        search,
        documentType,
        category,
        relatedEntityType,
        relatedEntityId,
      } = req.query;

      const result = await this.documentsService.getDocuments({
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
        search: search as string,
        documentType: documentType as string,
        category: category as string,
        relatedEntityType: relatedEntityType as string,
        relatedEntityId: relatedEntityId as string,
      });

      ResponseUtil.paginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  };

  getDocumentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const document = await this.documentsService.getDocumentById(id);
      ResponseUtil.success(res, document);
    } catch (error) {
      next(error);
    }
  };

  createDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        documentType,
        category,
        fileUrl,
        fileSize,
        mimeType,
        relatedEntityType,
        relatedEntityId,
        tags,
        isPublic,
      } = req.body;

      const document = await this.documentsService.createDocument({
        name,
        documentType,
        category,
        fileUrl,
        fileSize,
        mimeType,
        relatedEntityType,
        relatedEntityId,
        tags,
        isPublic,
        uploadedBy: req.user?.id,
      });

      ResponseUtil.success(res, document, 'Document created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  updateDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, documentType, category, tags, isPublic } = req.body;

      const document = await this.documentsService.updateDocument(id, {
        name,
        documentType,
        category,
        tags,
        isPublic,
      });

      ResponseUtil.success(res, document, 'Document updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.documentsService.deleteDocument(id);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  getDocumentStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.documentsService.getDocumentStats();
      ResponseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  };
}
