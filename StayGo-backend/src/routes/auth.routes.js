import { Router } from 'express';
import { login, logout, register } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/auth/register → Registrar usuario (público)
router.post('/register', register);

// POST /api/auth/login  → Iniciar sesión (público)
router.post('/login', login);

// POST /api/auth/logout  → Cerrar sesión (requiere token)
router.post('/logout', authenticate, logout);

export default router;
