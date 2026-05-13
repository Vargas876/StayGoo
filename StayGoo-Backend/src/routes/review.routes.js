import { Router } from 'express';
import {
    createReview,
    getReviewsByBooking
} from '../controllers/review.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/reviews/:id_booking  → Listar reviews de un booking (público)
router.get('/:id_booking', getReviewsByBooking);

// POST /api/reviews  → Crear review (protegido)
router.post('/', authenticate, createReview);

export default router;
