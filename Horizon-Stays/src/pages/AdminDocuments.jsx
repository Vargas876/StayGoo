import React, { useState, useEffect } from 'react';
import { getPendingDocuments, reviewDocument } from '../api';
import './AdminDocuments.css';

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectReason, setRejectReason] = useState({});

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await getPendingDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleReview = async (id, status) => {
    try {
      let reason = null;
      if (status === 'rejected') {
        reason = rejectReason[id];
        if (!reason || reason.trim() === '') {
          alert('Por favor indica un motivo de rechazo.');
          return;
        }
      }

      await reviewDocument(id, status, reason);
      
      // Remover de la lista una vez procesado
      setDocuments(docs => docs.filter(d => d.id !== id));
      if (status === 'rejected') {
        setRejectReason(prev => {
          const newReasons = {...prev};
          delete newReasons[id];
          return newReasons;
        });
      }
    } catch (err) {
      alert(`Error al procesar: ${err.message}`);
    }
  };

  const handleReasonChange = (id, value) => {
    setRejectReason(prev => ({...prev, [id]: value}));
  };

  if (loading) return <div className="admin-loader">Cargando documentos pendientes...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;

  return (
    <div className="admin-documents-page">
      <h2>Revisión de Documentos de Identidad</h2>
      
      {documents.length === 0 ? (
        <p className="empty-state">No hay documentos pendientes por revisar. 🎉</p>
      ) : (
        <div className="documents-grid">
          {documents.map(doc => (
            <div key={doc.id} className="document-card">
              <div className="doc-header">
                <p><strong>Usuario:</strong> {doc.user_email || doc.user_id}</p>
                <p className="doc-date">{new Date(doc.created_at).toLocaleString()}</p>
              </div>
              
              <div className="image-container">
                {doc.image_url ? (
                  <a href={doc.image_url} target="_blank" rel="noopener noreferrer" title="Click para abrir tamaño completo">
                    <img src={doc.image_url} alt="Documento de identidad" />
                  </a>
                ) : (
                  <p className="img-error">Error cargando imagen</p>
                )}
              </div>

              <div className="actions">
                <button 
                  className="btn-approve" 
                  onClick={() => handleReview(doc.id, 'approved')}
                >
                  ✅ Aprobar
                </button>
                
                <div className="reject-section">
                  <input 
                    type="text" 
                    placeholder="Escribe el motivo del rechazo..." 
                    value={rejectReason[doc.id] || ''}
                    onChange={(e) => handleReasonChange(doc.id, e.target.value)}
                  />
                  <button 
                    className="btn-reject" 
                    onClick={() => handleReview(doc.id, 'rejected')}
                  >
                    ❌ Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
