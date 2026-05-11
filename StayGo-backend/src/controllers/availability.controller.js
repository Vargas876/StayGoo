import * as availabilityService from '../services/availability.service.js';

/**
 * Availability Controller – Maneja peticiones HTTP para disponibilidad
 */

// POST /api/availability  → Registrar disponibilidad
export const createAvailability = async (req, res) => {
    try {
        const availabilityData = req.body;
        const data = await availabilityService.createAvailability(availabilityData);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/availability/:id_housing  → Consultar disponibilidad de un housing
export const getAvailabilityByHousing = async (req, res) => {
    try {
        const { id_housing } = req.params;
        const data = await availabilityService.getAvailabilityByHousing(id_housing);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
