import { supabase } from '../config/supabaseClient.js';

/**
 * Message Service – Lógica de negocio para mensajería entre usuarios
 * Tabla: message
 * Columnas: id_message, id_sender, id_receiver, id_housing, content, is_read, created_at
 */

// Enviar un mensaje (de id_sender a id_receiver, relacionado a id_housing)
export const sendMessage = async ({ id_sender, id_receiver, id_housing, content }) => {
    const { data, error } = await supabase
        .from('message')
        .insert([{ id_sender, id_receiver, id_housing, content }])
        .select()
        .single();
    if (error) throw error;
    return data;
};

// Obtener todos los mensajes de una conversación (entre dos users sobre un housing)
export const getMessagesByHousing = async (id_housing) => {
    const { data, error } = await supabase
        .from('message')
        .select('*')
        .eq('id_housing', id_housing)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
};

// Obtener todas las conversaciones de un usuario (como sender o receiver)
export const getConversationsByUser = async (id_user) => {
    const { data, error } = await supabase
        .from('message')
        .select(`
            *,
            housing (id_housing, name)
        `)
        .or(`id_sender.eq.${id_user},id_receiver.eq.${id_user}`)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

// Marcar un mensaje como leído
export const markMessageAsRead = async (id_message) => {
    const { data, error } = await supabase
        .from('message')
        .update({ is_read: true })
        .eq('id_message', id_message)
        .select()
        .single();
    if (error) throw error;
    return data;
};
