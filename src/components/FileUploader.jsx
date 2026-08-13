import React, { useState, useRef } from 'react';
import { UploadCloud, X, AlertCircle } from 'lucide-react';
import { triggerHaptic } from '../utils/telegramSdk';

export function FileUploader({ isOpen, onClose, onFileUpload, t }) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    setErrorMsg(null);
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setErrorMsg(t.invalidFile);
      triggerHaptic('notification', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target.result;
        onFileUpload(buffer, file.name);
        triggerHaptic('notification', 'success');
        onClose();
      } catch (err) {
        console.error('File reading error:', err);
        setErrorMsg('Failed to parse Excel file.');
        triggerHaptic('notification', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }} className="animate-fade-in">
      
      <div className="glass-card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '20px',
        position: 'relative',
        background: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px', color: '#fff' }}>
          {t.uploadTitle}
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {t.uploadSub}
        </p>

        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={{
            border: isDragging ? '2px dashed var(--accent-cyan)' : '2px dashed rgba(255, 255, 255, 0.15)',
            background: isDragging ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.02)',
            borderRadius: '14px',
            padding: '30px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
          />

          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            color: 'var(--accent-cyan)'
          }}>
            <UploadCloud size={28} />
          </div>

          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            {t.clickOrDrag}
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {t.supportFormats}
          </p>
        </div>

        {errorMsg && (
          <div style={{
            marginTop: '14px',
            padding: '8px 12px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '8px',
            color: '#fb7185',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
            {t.cancel}
          </button>
        </div>

      </div>
    </div>
  );
}
