import { Router } from 'express';
import {
    createBooking,
    getBookingById,
    cancelBooking
} from '../controllers/booking.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/bookings  → Crear reserva (protegido)
router.post('/', authenticate, createBooking);

// GET /api/bookings/:id_booking  → Consultar reserva (protegido)
router.get('/:id_booking', authenticate, getBookingById);

// PUT /api/bookings/:id_booking/cancel  → Cancelar reserva (protegido)
router.put('/:id_booking/cancel', authenticate, cancelBooking);

export default router;
