import * as bookingService from '../services/booking.service.js';

/**
 * Booking Controller – Maneja peticiones HTTP para reservas
 */

// POST /api/bookings  → Crear una reserva
export const createBooking = async (req, res) => {
    try {
        const bookingData = req.body;
        const data = await bookingService.createBooking(bookingData);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/bookings/:id_booking  → Consultar una reserva
export const getBookingById = async (req, res) => {
    try {
        const { id_booking } = req.params;
        const data = await bookingService.getBookingById(id_booking);
        res.status(200).json(data);
    } catch (error) {
        res.status(404).json({ error: 'Reserva no encontrada.' });
    }
};

// PUT /api/bookings/:id_booking/cancel  → Cancelar una reserva
export const cancelBooking = async (req, res) => {
    try {
        const { id_booking } = req.params;
        const data = await bookingService.cancelBooking(id_booking);
        res.status(200).json({ message: 'Reserva cancelada.', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
