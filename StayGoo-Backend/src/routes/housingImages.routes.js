import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upload, uploadHousingImage, deleteHousingImage } from '../controllers/housingImages.controller.js';

const router = Router();

// Subir imagen a un alojamiento (Host autenticado)
router.post('/:id_housing/images', authenticate, upload.single('image'), uploadHousingImage);

// Eliminar imagen de un alojamiento (Host autenticado)
router.delete('/images/:id_image', authenticate, deleteHousingImage);

export default router;
