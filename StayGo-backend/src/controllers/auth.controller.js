import * as authService from '../services/auth.service.js';

/**
 * Auth Controller – Maneja peticiones HTTP para autenticación
 */

// POST /api/auth/register → Registrar nuevo usuario
export const register = async (req, res) => {
    try {
        const { email, password, nombre, apellido, telefono, fechaNacimiento, pais, tipoUsuario } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
        }

        // Unificamos nombre y apellido para el servicio
        const fullName = `${nombre} ${apellido}`.trim();

        // Mapeo de roles: 1=admin, 2=host, 3=guest (viajero)
        let roleId = 3; // Por defecto viajero
        if (tipoUsuario === 'host') {
            roleId = 2;
        } else if (tipoUsuario === 'admin') {
            roleId = 1;
        }

        const data = await authService.registerUser({ 
            email, 
            password, 
            fullName, 
            phone: telefono,
            birthDate: fechaNacimiento,
            country: pais,
            userType: roleId // Enviamos el número ahora
        });

        res.status(201).json({ message: 'Usuario registrado exitosamente.', data });
    } catch (error) {
        console.error('❌ Error en el registro:', error);
        res.status(500).json({ error: error.message || 'Error interno al registrar usuario.' });
    }
};

// POST /api/auth/login  → Iniciar sesión
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
        }
        const data = await authService.loginUser({ email, password });
        res.status(200).json({ message: 'Sesión iniciada.', data });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

// POST /api/auth/logout  → Cerrar sesión
export const logout = async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        await authService.logoutUser(token);
        res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
