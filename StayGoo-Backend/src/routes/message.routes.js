import { Router } from 'express';
import {
    sendMessage,
    getMessagesByHousing,
    getConversationsByUser,
    markMessageAsRead
} from '../controllers/message.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/messages  → Enviar mensaje (protegido)
router.post('/', authenticate, sendMessage);

// GET /api/messages/housing/:id_housing  → Mensajes de un housing (protegido)
router.get('/housing/:id_housing', authenticate, getMessagesByHousing);

// GET /api/messages/conversation/:id_user  → Conversaciones de un usuario (protegido)
router.get('/conversation/:id_user', authenticate, getConversationsByUser);

// PATCH /api/messages/:id_message/read  → Marcar como leído (protegido)
router.patch('/:id_message/read', authenticate, markMessageAsRead);

export default router;
