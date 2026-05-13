import * as serviceService from '../services/service.service.js';

/**
 * Service Controller – Maneja peticiones HTTP para servicios
 */

// GET /api/services  → Listar servicios disponibles
export const getServices = async (req, res) => {
    try {
        const data = await serviceService.getServices();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/housings/:id_housing/services  → Asignar servicio a un housing
export const assignServiceToHousing = async (req, res) => {
    try {
        const { id_housing } = req.params;
        const { id_service } = req.body;
        if (!id_service) {
            return res.status(400).json({ error: 'id_service es requerido.' });
        }
        const data = await serviceService.assignServiceToHousing(id_housing, id_service);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
