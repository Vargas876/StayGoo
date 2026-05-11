/* src/services/auth.service.js */
import { supabase } from '../config/supabaseClient.js';

export const registerUser = async ({ email, password, fullName, phone }) => {
    // 1. Registramos al usuario en la tabla interna 'auth'
    const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName, phone }
        }
    });

    if (authError) throw authError;

    // El trigger `on_auth_user_created` en Supabase se encargará automáticamente
    // de insertar el registro en `public.user`.
    return data;
};

// ... (El resto del archivo login/logout se queda igual)


// Iniciar sesión con email y contraseña
export const loginUser = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
};

// Cerrar sesión (invalida el token actual)
export const logoutUser = async (token) => {
    // Usamos el cliente con el token del usuario para hacer signOut correcto
    const { error } = await supabase.auth.admin.signOut(token);
    if (error) {
        // fallback: signOut global
        const { error: err2 } = await supabase.auth.signOut();
        if (err2) throw err2;
    }
};
