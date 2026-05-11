import { supabase } from '../config/supabaseClient.js';

/**
 * Middleware de autenticación.
 * Verifica el JWT de Supabase enviado en el header Authorization: Bearer <token>
 * Si es válido, adjunta el usuario a req.user y llama next().
 * Si no, responde con 401.
 */
export const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticación no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data?.user) {
            return res.status(401).json({ error: 'Token inválido o expirado.' });
        }

        req.user = data.user; // { id, email, ... }
        next();
    } catch (err) {
        return res.status(500).json({ error: 'Error verificando el token.' });
    }
};
