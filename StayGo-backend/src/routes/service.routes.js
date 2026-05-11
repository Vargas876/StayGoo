import { Router } from 'express';
import { getServices } from '../controllers/service.controller.js';

const router = Router();

// GET /api/services  → Listar servicios disponibles (público)
router.get('/', getServices);

export default router;
