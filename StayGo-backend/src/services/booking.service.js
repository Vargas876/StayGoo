import { supabase } from '../config/supabaseClient.js';

/**
 * Booking Service – Lógica de negocio para reservas
 * Tabla: booking
 */

// Crear una nueva reserva
export const createBooking = async (bookingData) => {
    const { data, error } = await supabase
        .from('booking')
        .insert([bookingData])
        .select()
        .single();
    if (error) throw error;
    return data;
};

// Consultar detalle de una reserva por ID
export const getBookingById = async (id_booking) => {
    const { data, error } = await supabase
        .from('booking')
        .select(`
            *,
            housing (id_housing, name, address, price_per_night),
            user (id_user, name, email)
        `)
        .eq('id_booking', id_booking)
        .single();
    if (error) throw error;
    return data;
};

// Cancelar una reserva (actualiza el status a 'cancelled')
export const cancelBooking = async (id_booking) => {
    const { data, error } = await supabase
        .from('booking')
        .update({ status: 'cancelled' })
        .eq('id_booking', id_booking)
        .select()
        .single();
    if (error) throw error;
    return data;
};
