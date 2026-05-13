import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upload, uploadDocument, getPendingDocuments, reviewDocument } from '../controllers/documents.controller.js';

const router = Router();

// Subir documento (autenticado)
router.post('/upload', authenticate, upload.single('document'), uploadDocument);

// Obtener documentos pendientes (solo admins, validado en el controller)
router.get('/pending', authenticate, getPendingDocuments);

// Aprobar o rechazar documento (solo admins)
router.patch('/:id/review', authenticate, reviewDocument);

export default router;
