import React, { useState, useEffect } from 'react';
import { uploadDocument } from '../api';
import { supabase } from '../supabaseClient';
import './DocumentUpload.css';

export default function DocumentUpload({ userId }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, missing, pending, approved, rejected
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch initial status from Supabase directly
  useEffect(() => {
    if (!userId) return;

    const fetchDocument = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error; 
        
        if (data) {
          setDocument(data);
          setStatus(data.status);
        } else {
          setStatus('missing');
        }
      } catch (err) {
        console.error("Error fetching document:", err);
      }
    };

    fetchDocument();

    // Suscripción a Realtime para escuchar cambios (aprobaciones/rechazos de admin)
    const channel = supabase
      .channel('public:documents')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.new) {
            setDocument(payload.new);
            setStatus(payload.new.status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError('El archivo no debe superar los 5 MB');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await uploadDocument(formData);
      setDocument(res.document);
      setStatus(res.document.status);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (status === 'loading') return <div className="loader">Cargando estado...</div>;

  return (
    <div className="document-upload-container">
      <h3>Verificación de Identidad</h3>
      
      {status === 'approved' && (
        <div className="alert alert-success">
          <span className="icon">✅</span>
          <p>Tu documento ha sido aprobado. Tu identidad está verificada.</p>
        </div>
      )}

      {status === 'pending' && (
        <div className="alert alert-warning">
          <span className="icon">⏳</span>
          <p>Tu documento está en revisión. Te notificaremos cuando sea aprobado.</p>
        </div>
      )}

      {status === 'rejected' && (
        <div className="alert alert-error">
          <span className="icon">❌</span>
          <div>
            <p>Tu documento fue rechazado.</p>
            <p className="reject-reason"><strong>Motivo:</strong> {document?.rejection_reason}</p>
          </div>
        </div>
      )}

      {(status === 'missing' || status === 'rejected') && (
        <form onSubmit={handleUpload} className="upload-form">
          <p className="upload-desc">Sube una foto clara de tu documento de identidad (JPG, PNG, WEBP - Max 5MB).</p>
          <div className="file-input-wrapper">
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/webp" 
              onChange={handleFileChange}
              disabled={isUploading}
              id="doc-upload"
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={!file || isUploading} className="btn-primary">
            {isUploading ? 'Subiendo...' : 'Subir Documento'}
          </button>
        </form>
      )}
    </div>
  );
}
