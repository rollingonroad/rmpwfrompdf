'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { detectLanguage, isRTL, t, type Language } from '@/i18n';

interface UploadedFile {
  id: string;
  file: File;
  password: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  result?: ArrayBuffer;
  error?: string;
}

export default function Home() {
  const [locale, setLocale] = useState<Language>('en');
  const [rtl, setRtl] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const lang = detectLanguage(navigator.language);
    setLocale(lang);
    setRtl(isRTL(lang));
  }, []);

  const tr = useCallback((key: string) => t(key, locale), [locale]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      password: '',
      status: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const handlePasswordChange = (id: string, password: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, password } : f))
    );
  };

  const handleProcess = async (id: string) => {
    const fileItem = files.find((f) => f.id === id);
    if (!fileItem) return;

    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'processing' as const } : f))
    );

    try {
      const formData = new FormData();
      formData.append('file', fileItem.file);
      formData.append('password', fileItem.password);

      const response = await fetch('/api/remove-password', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to process PDF' }));
        throw new Error(errorData.error || 'Failed to process PDF');
      }

      const arrayBuffer = await response.arrayBuffer();

      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: 'success' as const, result: arrayBuffer } : f
        )
      );
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: 'error' as const,
                error: err instanceof Error ? err.message : 'Unknown error',
              }
            : f
        )
      );
    }
  };

  const handleDownload = (id: string) => {
    const fileItem = files.find((f) => f.id === id);
    if (!fileItem || !fileItem.result) return;

    const blob = new Blob([fileItem.result], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileItem.file.name.replace(/\.pdf$/i, '') + '_unlocked.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDownloadAll = () => {
    files
      .filter((f) => f.status === 'success' && f.result)
      .forEach((f) => {
        const blob = new Blob([f.result!], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = f.file.name.replace(/\.pdf$/i, '') + '_unlocked.pdf';
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  const handleClearAll = () => {
    setFiles([]);
  };

  const successCount = files.filter((f) => f.status === 'success').length;

  if (!mounted) return null;

  return (
    <div
      className="min-h-screen bg-[#F5F5F7]"
      dir={rtl ? 'rtl' : 'ltr'}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {/* Main Content */}
      <main className="max-w-[680px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-[48px] font-semibold text-[#1D1D1F] mb-4 tracking-tight">
            {tr('title')}
          </h1>
          <p className="text-[21px] text-[#86868B] leading-relaxed max-w-[540px] mx-auto">
            {tr('description')}
          </p>
        </div>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`
            relative rounded-[18px] border-2 border-dashed transition-all duration-200 cursor-pointer
            ${isDragActive
              ? 'border-[#007AFF] bg-[#F5F5F7]'
              : 'border-[#D2D2D7] bg-white hover:border-[#AEAEB2]'
            }
          `}
          style={{
            padding: '64px 40px',
            boxShadow: isDragActive
              ? '0 0 0 4px rgba(0, 122, 255, 0.1)'
              : '0 2px 12px rgba(0, 0, 0, 0.04)',
          }}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center">
            {/* Upload Icon */}
            <div
              className="w-16 h-16 rounded-[16px] bg-[#007AFF] flex items-center justify-center mb-6"
              style={{ boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>

            <p className="text-[19px] font-medium text-[#1D1D1F] mb-2">
              {isDragActive ? tr('dropzone').split(',')[0] : tr('dropzone')}
            </p>
            <p className="text-[15px] text-[#86868B]">PDF</p>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-[#1D1D1F]">
                {tr('fileList')} ({files.length})
              </h2>
              {successCount > 0 && (
                <button
                  onClick={handleDownloadAll}
                  className="text-[15px] font-medium text-[#007AFF] hover:text-[#0056CC] transition-colors"
                >
                  {tr('downloadAll')}
                </button>
              )}
            </div>

            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-[16px] p-4 flex items-center gap-4"
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {/* File Icon */}
                  <div className="w-10 h-10 rounded-[8px] bg-[#FF3B30] flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#1D1D1F] truncate">{file.file.name}</p>
                    <p className="text-[13px] text-[#86868B]">{(file.file.size / 1024).toFixed(1)} KB</p>
                  </div>

                  {/* Actions */}
                  {file.status === 'pending' && (
                    <>
                      <input
                        type="password"
                        placeholder={tr('passwordPlaceholder')}
                        value={file.password}
                        onChange={(e) => handlePasswordChange(file.id, e.target.value)}
                        className="w-[160px] px-3 py-2 text-[15px] rounded-[10px] border border-[#D2D2D7] bg-white focus:border-[#007AFF] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
                      />
                      <button
                        onClick={() => handleProcess(file.id)}
                        disabled={!file.password}
                        className="px-5 py-2 text-[15px] font-medium text-white bg-[#007AFF] rounded-[10px] hover:bg-[#0056CC] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        style={{ boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)' }}
                      >
                        {tr('process')}
                      </button>
                    </>
                  )}

                  {file.status === 'processing' && (
                    <div className="flex items-center gap-2 text-[#86868B]">
                      <div className="w-4 h-4 border-2 border-[#86868B] border-t-transparent rounded-full animate-spin"/>
                      <span className="text-[15px]">{tr('processing')}</span>
                    </div>
                  )}

                  {file.status === 'success' && (
                    <>
                      <span className="text-[15px] font-medium text-[#34C759]">{tr('success')}</span>
                      <button
                        onClick={() => handleDownload(file.id)}
                        className="px-5 py-2 text-[15px] font-medium text-white bg-[#34C759] rounded-[10px] hover:bg-[#28A745] transition-all"
                        style={{ boxShadow: '0 2px 8px rgba(52, 199, 89, 0.3)' }}
                      >
                        {tr('download')}
                      </button>
                    </>
                  )}

                  {file.status === 'error' && (
                    <>
                      <span className="text-[14px] text-[#FF3B30]">{file.error || tr('wrongPassword')}</span>
                      <button
                        onClick={() => handleProcess(file.id)}
                        className="px-5 py-2 text-[15px] font-medium text-white bg-[#007AFF] rounded-[10px] hover:bg-[#0056CC] transition-all"
                        style={{ boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)' }}
                      >
                        {tr('process')}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleRemove(file.id)}
                    className="w-8 h-8 flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-[8px] transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Clear All */}
            <button
              onClick={handleClearAll}
              className="w-full py-3 text-[15px] font-medium text-[#86868B] hover:text-[#1D1D1F] rounded-[12px] hover:bg-[#E8E8ED] transition-all"
            >
              {tr('clearAll')}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-[13px] text-[#86868B]">
        © 2026
      </footer>
    </div>
  );
}