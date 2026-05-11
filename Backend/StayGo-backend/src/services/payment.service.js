import { supabase } from '../config/supabaseClient.js';

/**
 * Payment Service – Lógica de negocio para pagos
 * Tablas: pay, payment_method
 */

// Registrar un nuevo pago
export const createPayment = async (paymentData) => {
    const { data, error } = await supabase
        .from('pay')
        .insert([paymentData])
        .select()
        .single();
    if (error) throw error;
    return data;
};

// Consultar el estado de un pago por ID
export const getPaymentById = async (id_payment) => {
    const { data, error } = await supabase
        .from('pay')
        .select(`
            *,
            payment_method (id_payment, name),
            booking (id_booking, status)
        `)
        .eq('id_payment_trx', id_payment)
        .single();
    if (error) throw error;
    return data;
};

// Listar todos los métodos de pago disponibles
export const getPaymentMethods = async () => {
    const { data, error } = await supabase
        .from('payment_method')
        .select('*');
    if (error) throw error;
    return data;
};
