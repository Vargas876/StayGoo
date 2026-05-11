import * as messageService from '../services/message.service.js';

/**
 * Message Controller – Maneja peticiones HTTP para mensajería
 */

// POST /api/messages  → Enviar un mensaje
export const sendMessage = async (req, res) => {
    try {
        const { id_receiver, id_housing, content } = req.body;
        const id_sender = req.user.id; // extraído del token JWT por el middleware

        if (!id_receiver || !content) {
            return res.status(400).json({ error: 'id_receiver y content son requeridos.' });
        }

        const data = await messageService.sendMessage({ id_sender, id_receiver, id_housing, content });
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/messages/housing/:id_housing  → Mensajes de un housing
export const getMessagesByHousing = async (req, res) => {
    try {
        const { id_housing } = req.params;
        const data = await messageService.getMessagesByHousing(id_housing);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/messages/conversation/:id_user  → Conversaciones de un usuario
export const getConversationsByUser = async (req, res) => {
    try {
        const { id_user } = req.params;
        const data = await messageService.getConversationsByUser(id_user);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PATCH /api/messages/:id_message/read  → Marcar mensaje como leído
export const markMessageAsRead = async (req, res) => {
    try {
        const { id_message } = req.params;
        const data = await messageService.markMessageAsRead(id_message);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
