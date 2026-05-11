import * as paymentService from '../services/payment.service.js';

/**
 * Payment Controller – Maneja peticiones HTTP para pagos
 */

// POST /api/payments  → Registrar un pago
export const createPayment = async (req, res) => {
    try {
        const paymentData = req.body;
        const data = await paymentService.createPayment(paymentData);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/payments/:id_payment  → Consultar estado de un pago
export const getPaymentById = async (req, res) => {
    try {
        const { id_payment } = req.params;
        const data = await paymentService.getPaymentById(id_payment);
        res.status(200).json(data);
    } catch (error) {
        res.status(404).json({ error: 'Pago no encontrado.' });
    }
};

// GET /api/payment_method  → Listar métodos de pago
export const getPaymentMethods = async (req, res) => {
    try {
        const data = await paymentService.getPaymentMethods();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
