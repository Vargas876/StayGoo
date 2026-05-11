import { Router } from 'express';
import {
    createNotification,
    getNotificationsByUser
} from '../controllers/notification.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/notifications/:id_user  → Listar notificaciones (protegido)
router.get('/:id_user', authenticate, getNotificationsByUser);

// POST /api/notifications  → Crear notificación (protegido)
router.post('/', authenticate, createNotification);

export default router;
