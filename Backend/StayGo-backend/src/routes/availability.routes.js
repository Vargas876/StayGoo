import { Router } from 'express';
import {
    createAvailability,
    getAvailabilityByHousing
} from '../controllers/availability.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/availability/:id_housing  → Consultar disponibilidad (público)
router.get('/:id_housing', getAvailabilityByHousing);

// POST /api/availability  → Registrar disponibilidad (protegido)
router.post('/', authenticate, createAvailability);

export default router;
