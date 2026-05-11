import { supabase } from '../config/supabaseClient.js';

/**
 * Notification Service – Lógica de negocio para notificaciones
 * Tabla: notification
 */

// Crear una notificación para un usuario
export const createNotification = async (notificationData) => {
    const { data, error } = await supabase
        .from('notification')
        .insert([notificationData])
        .select()
        .single();
    if (error) throw error;
    return data;
};

// Listar todas las notificaciones de un usuario
export const getNotificationsByUser = async (id_user) => {
    const { data, error } = await supabase
        .from('notification')
        .select('*')
        .eq('id_user', id_user)
        .order('id_notification', { ascending: false });
    if (error) throw error;
    return data;
};
