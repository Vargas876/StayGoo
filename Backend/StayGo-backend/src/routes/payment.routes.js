import { Router } from 'express';
import {
    createPayment,
    getPaymentById,
    getPaymentMethods
} from '../controllers/payment.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/payment_method  → Listar métodos de pago (público)
router.get('/methods', getPaymentMethods);

// POST /api/payments  → Registrar pago (protegido)
router.post('/', authenticate, createPayment);

// GET /api/payments/:id_payment  → Consultar pago (protegido)
router.get('/:id_payment', authenticate, getPaymentById);

export default router;
