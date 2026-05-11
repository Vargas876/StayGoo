import * as housingService from '../services/housing.service.js';

/**
 * Housing Controller – Maneja peticiones HTTP para alojamientos
 */

// GET /api/housings  → Listar todos los alojamientos
export const getHousings = async (req, res) => {
    try {
        const data = await housingService.getHousings();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/housings/:id_housing  → Detalle de un alojamiento
export const getHousingById = async (req, res) => {
    try {
        const { id_housing } = req.params;
        const data = await housingService.getHousingById(id_housing);
        res.status(200).json(data);
    } catch (error) {
        res.status(404).json({ error: 'Alojamiento no encontrado.' });
    }
};

// POST /api/housings  → Publicar un nuevo alojamiento
export const createHousing = async (req, res) => {
    try {
        const housingData = req.body;
        const data = await housingService.createHousing(housingData);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/housings/:id_housing  → Actualizar alojamiento
export const updateHousing = async (req, res) => {
    try {
        const { id_housing } = req.params;
        const updates = req.body;
        const data = await housingService.updateHousing(id_housing, updates);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/housings/:id_housing  → Eliminar alojamiento
export const deleteHousing = async (req, res) => {
    try {
        const { id_housing } = req.params;
        const data = await housingService.deleteHousing(id_housing);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/type_housing  → Listar tipos de alojamiento
export const getTypeHousings = async (req, res) => {
    try {
        const data = await housingService.getTypeHousings();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
