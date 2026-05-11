import { Router } from 'express';
import {
    getHousings,
    getHousingById,
    createHousing,
    updateHousing,
    deleteHousing,
    getTypeHousings
} from '../controllers/housing.controller.js';
import { assignServiceToHousing } from '../controllers/service.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/housings  → Listar alojamientos (público)
router.get('/', getHousings);

// GET /api/housings/types → Listar tipos de alojamiento (público)
router.get('/types', getTypeHousings);

// GET /api/housings/:id_housing  → Detalle de alojamiento (público)
router.get('/:id_housing', getHousingById);

// POST /api/housings  → Publicar alojamiento (protegido)
router.post('/', authenticate, createHousing);

// PUT /api/housings/:id_housing  → Actualizar alojamiento (protegido)
router.put('/:id_housing', authenticate, updateHousing);

// DELETE /api/housings/:id_housing  → Eliminar alojamiento (protegido)
router.delete('/:id_housing', authenticate, deleteHousing);

// POST /api/housings/:id_housing/services  → Asignar servicio (protegido)
router.post('/:id_housing/services', authenticate, assignServiceToHousing);

export default router;
