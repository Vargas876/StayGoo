import { supabase } from '../config/supabaseClient.js';

/**
 * Availability Service – Lógica de negocio para disponibilidad de alojamientos
 * Tabla: availability
 */

// Registrar disponibilidad para un alojamiento
export const createAvailability = async (availabilityData) => {
    const { data, error } = await supabase
        .from('availability')
        .insert([availabilityData])
        .select()
        .single();
    if (error) throw error;
    return data;
};

// Consultar la disponibilidad de un alojamiento específico
export const getAvailabilityByHousing = async (id_housing) => {
    const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('id_housing', id_housing);
    if (error) throw error;
    return data;
};
