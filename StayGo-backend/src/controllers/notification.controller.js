import * as notificationService from '../services/notification.service.js';

/**
 * Notification Controller – Maneja peticiones HTTP para notificaciones
 */

// POST /api/notifications  → Crear una notificación
export const createNotification = async (req, res) => {
    try {
        const notificationData = req.body;
        const data = await notificationService.createNotification(notificationData);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/notifications/:id_user  → Listar notificaciones de un usuario
export const getNotificationsByUser = async (req, res) => {
    try {
        const { id_user } = req.params;
        const data = await notificationService.getNotificationsByUser(id_user);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
