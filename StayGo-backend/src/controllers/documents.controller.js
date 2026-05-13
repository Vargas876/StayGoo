import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import { extname } from 'path';

// Configuración de multer (almacenamiento en memoria)
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP.'));
        }
    }
});

// Helper para instanciar el cliente con el token del usuario actual
// Así se aplican las reglas de RLS correctamente
const getAuthClient = (req) => {
    const token = req.headers['authorization']?.split(' ')[1];
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
        global: {
            headers: { Authorization: `Bearer ${token}` }
        }
    });
};

export const uploadDocument = async (req, res) => {
    try {
        const file = req.file;
        const userId = req.user.id;

        if (!file) {
            return res.status(400).json({ error: 'Debes proporcionar una imagen.' });
        }

        const authClient = getAuthClient(req);

        // Subir imagen a Supabase Storage
        const fileExt = extname(file.originalname);
        const fileName = `${userId}-${Date.now()}${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { data: storageData, error: storageError } = await authClient.storage
            .from('identity-docs')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (storageError) throw storageError;

        // Crear registro en la tabla documents
        const { data: docData, error: docError } = await authClient
            .from('documents')
            .insert([
                {
                    user_id: userId,
                    storage_path: storageData.path,
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (docError) {
            // Revertir subida si falla DB
            await authClient.storage.from('identity-docs').remove([storageData.path]);
            throw docError;
        }

        return res.status(201).json({ message: 'Documento subido con éxito.', document: docData });

    } catch (error) {
        console.error('Error subiendo documento:', error);
        return res.status(500).json({ error: error.message || 'Error al procesar la solicitud.' });
    }
};

export const getPendingDocuments = async (req, res) => {
    try {
        // Verificar rol admin en el metadata del JWT
        if (req.user.user_metadata?.role !== 'admin') {
            return res.status(403).json({ error: 'No tienes permisos de administrador.' });
        }

        const authClient = getAuthClient(req);

        // Obtener documentos pendientes uniendo con public.user para el email
        const { data: documents, error } = await authClient
            .from('documents')
            .select(`
                *,
                user:user_id (email)
            `)
            .eq('status', 'pending');

        if (error) throw error;

        // Generar Signed URLs (10 min = 600 seg)
        const documentsWithUrls = await Promise.all(documents.map(async (doc) => {
            const { data: urlData, error: urlError } = await authClient.storage
                .from('identity-docs')
                .createSignedUrl(doc.storage_path, 600);
            
            return {
                ...doc,
                user_email: doc.user?.email, // Extraemos para fácil lectura en front
                image_url: urlError ? null : urlData.signedUrl
            };
        }));

        return res.status(200).json(documentsWithUrls);
    } catch (error) {
        console.error('Error obteniendo documentos:', error);
        return res.status(500).json({ error: error.message || 'Error interno del servidor.' });
    }
};

export const reviewDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;
        const reviewerId = req.user.id;

        if (req.user.user_metadata?.role !== 'admin') {
            return res.status(403).json({ error: 'No tienes permisos de administrador.' });
        }

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status inválido. Usa approved o rejected.' });
        }

        if (status === 'rejected' && !rejection_reason) {
            return res.status(400).json({ error: 'El motivo de rechazo es obligatorio.' });
        }

        const authClient = getAuthClient(req);

        // Verificar que siga en pending
        const { data: currentDoc, error: fetchError } = await authClient
            .from('documents')
            .select('status')
            .eq('id', id)
            .single();
            
        if (fetchError) throw fetchError;
        
        if (currentDoc.status !== 'pending') {
            return res.status(409).json({ error: 'El documento ya ha sido procesado (puede haber sido revisado por otro admin).' });
        }

        // Actualizar estado
        const { data: updatedDoc, error: updateError } = await authClient
            .from('documents')
            .update({
                status,
                rejection_reason: status === 'rejected' ? rejection_reason : null,
                reviewer_id: reviewerId,
                reviewed_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        return res.status(200).json({ message: `Documento ${status}.`, document: updatedDoc });

    } catch (error) {
        console.error('Error revisando documento:', error);
        return res.status(500).json({ error: error.message || 'Error interno del servidor.' });
    }
};
