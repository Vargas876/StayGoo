import { supabase } from '../config/supabaseClient.js';

/**
 * Housing Service – Lógica de negocio para alojamientos
 * Tabla: housing, type_housing
 */

// Listar todos los alojamientos con su tipo
export const getHousings = async () => {
    const { data, error } = await supabase
        .from('housing')
        .select(`
            *,
            type_housing (id_type, name)
        `);
    if (error) throw error;
    return data;
};

// Obtener detalle de un alojamiento por ID
export const getHousingById = async (id_housing) => {
    const { data, error } = await supabase
        .from('housing')
        .select(`
            *,
            type_housing (id_type, name),
            availability (*),
            housing_service (
                service (id_service, name)
            )
        `)
        .eq('id_housing', id_housing)
        .single();
    if (error) throw error;
    return data;
};

// Publicar un nuevo alojamiento
export const createHousing = async (housingData) => {
    const { data, error } = await supabase
        .from('housing')
        .insert([housingData])
        .select()
        .single();
    if (error) throw error;
    return data;
};

// Actualizar información de un alojamiento
export const updateHousing = async (id_housing, updates) => {
    const { data, error } = await supabase
        .from('housing')
        .update(updates)
        .eq('id_housing', id_housing)
        .select()
        .single();
    if (error) throw error;
    return data;
};

// Eliminar un alojamiento
export const deleteHousing = async (id_housing) => {
    const { error } = await supabase
        .from('housing')
        .delete()
        .eq('id_housing', id_housing);
    if (error) throw error;
    return { message: 'Housing eliminado correctamente.' };
};

// Listar tipos de alojamiento
export const getTypeHousings = async () => {
    const { data, error } = await supabase
        .from('type_housing')
        .select('*');
    if (error) throw error;
    return data;
};
