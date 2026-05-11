import * as userService from '../services/user.service.js';

/**
 * User Controller – Maneja peticiones HTTP para gestión de usuarios
 */

// GET /api/users/:id_user  → Obtener perfil de usuario
export const getUserById = async (req, res) => {
    try {
        const { id_user } = req.params;
        const data = await userService.getUserById(id_user);
        res.status(200).json(data);
    } catch (error) {
        res.status(404).json({ error: 'Usuario no encontrado.' });
    }
};

// PUT /api/users/:id_user  → Actualizar datos del usuario
export const updateUser = async (req, res) => {
    try {
        const { id_user } = req.params;
        const updates = req.body;

        // Sólo permite actualizar su propio perfil
        if (req.user.id !== id_user) {
            return res.status(403).json({ error: 'No autorizado para editar este perfil.' });
        }

        const data = await userService.updateUser(id_user, updates);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/roles  → Listar roles disponibles
export const getRoles = async (req, res) => {
    try {
        const data = await userService.getRoles();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
