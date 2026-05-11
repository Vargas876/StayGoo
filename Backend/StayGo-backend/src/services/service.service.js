import { supabase } from '../config/supabaseClient.js';

/**
 * Service Service – Lógica de negocio para servicios y asignación a Housing
 * Tablas: service, housing_service
 */

// Listar todos los servicios disponibles
export const getServices = async () => {
    const { data, error } = await supabase
        .from('service')
        .select('*');
    if (error) throw error;
    return data;
};

// Asignar un servicio a un Housing (tabla pivote housing_service)
export const assignServiceToHousing = async (id_housing, id_service) => {
    const { data, error } = await supabase
        .from('housing_service')
        .insert([{ id_housing, id_service }])
        .select()
        .single();
    if (error) throw error;
    return data;
};
