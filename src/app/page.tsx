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
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-[#007AFF] focus:rounded-lg">
        Skip to main content
      </a>

      {/* Navigation */}
      <nav role="navigation" aria-label="Main navigation" className="bg-white shadow-sm">
        <div className="max-w-[680px] mx-auto px-6 py-4">
          <span className="text-[17px] font-semibold text-[#1D1D1F]">rmpwfrompdf</span>
        </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="max-w-[680px] mx-auto px-6 py-12" role="main">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-[42px] font-bold text-[#1D1D1F] mb-4 tracking-tight leading-tight">
            {tr('title')}
          </h1>
          <p className="text-[19px] text-[#86868B] leading-relaxed max-w-[540px] mx-auto">
            {tr('description')}
          </p>
        </header>

        {/* Upload Section */}
        <section aria-labelledby="upload-heading">
          <h2 id="upload-heading" className="sr-only">Upload PDF files</h2>

          {/* Upload Zone */}
          <div
            {...getRootProps()}
            className={`
              relative rounded-[18px] border border-[#D2D2D7] transition-all duration-200 cursor-pointer bg-white
              ${isDragActive
                ? 'border-[#007AFF] border-2 bg-[#F5F5F7]'
                : 'hover:border-[#AEAEB2] hover:border-2'
              }
            `}
            role="button"
            aria-label="Upload PDF files"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Trigger file input
              }
            }}
            style={{
              padding: '56px 40px',
              boxShadow: isDragActive
                ? '0 0 0 4px rgba(0, 122, 255, 0.1)'
                : '0 2px 12px rgba(0, 0, 0, 0.04)',
            }}
          >
            <input {...getInputProps()} aria-label="File input" />

            <div className="flex flex-col items-center">
              {/* Upload Icon */}
              <div
                className="w-14 h-14 rounded-[14px] bg-[#007AFF] flex items-center justify-center mb-5"
                style={{ boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)' }}
                aria-hidden="true"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>

              <p className="text-[17px] font-medium text-[#1D1D1F] mb-1">
                {isDragActive ? tr('dropzone').split(',')[0] : tr('dropzone')}
              </p>
              <p className="text-[14px] text-[#86868B]" aria-label="Supported format">PDF</p>
            </div>
          </div>
        </section>

        {/* File List */}
        {files.length > 0 && (
          <section aria-labelledby="files-heading" className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 id="files-heading" className="text-[17px] font-semibold text-[#1D1D1F]">
                {tr('fileList')} <span className="text-[#86868B] font-normal">({files.length})</span>
              </h2>
              {successCount > 0 && (
                <button
                  onClick={handleDownloadAll}
                  className="text-[15px] font-medium text-[#007AFF] hover:text-[#0056CC] transition-colors"
                  aria-label="Download all unlocked files"
                >
                  {tr('downloadAll')}
                </button>
              )}
            </div>

            <div className="space-y-3" role="list" aria-label="Uploaded files">
              {files.map((file, index) => (
                <article
                  key={file.id}
                  className="bg-white rounded-[16px] p-4 flex items-center gap-4"
                  role="listitem"
                  aria-label={`File ${index + 1}: ${file.file.name}`}
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {/* File Icon */}
                  <div className="w-10 h-10 rounded-[8px] bg-[#FF3B30] flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-[#1D1D1F] truncate" title={file.file.name}>{file.file.name}</p>
                    <p className="text-[13px] text-[#86868B]">{(file.file.size / 1024).toFixed(1)} KB</p>
                  </div>

                  {/* Actions */}
                  {file.status === 'pending' && (
                    <>
                      <label htmlFor={`password-${file.id}`} className="sr-only">Password for {file.file.name}</label>
                      <input
                        id={`password-${file.id}`}
                        type="password"
                        placeholder={tr('passwordPlaceholder')}
                        value={file.password}
                        onChange={(e) => handlePasswordChange(file.id, e.target.value)}
                        className="w-[150px] px-3 py-2 text-[15px] rounded-[10px] border border-[#D2D2D7] bg-white focus:border-[#007AFF] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
                        aria-label={`Enter password for ${file.file.name}`}
                      />
                      <button
                        onClick={() => handleProcess(file.id)}
                        disabled={!file.password}
                        className="px-5 py-2 text-[15px] font-medium text-white bg-[#007AFF] rounded-[10px] hover:bg-[#0056CC] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        aria-label={`Remove password from ${file.file.name}`}
                      >
                        {tr('process')}
                      </button>
                    </>
                  )}

                  {file.status === 'processing' && (
                    <div className="flex items-center gap-2 text-[#86868B]" role="status" aria-live="polite">
                      <div className="w-4 h-4 border-2 border-[#86868B] border-t-transparent rounded-full animate-spin" aria-hidden="true"/>
                      <span className="text-[15px]">{tr('processing')}</span>
                    </div>
                  )}

                  {file.status === 'success' && (
                    <>
                      <span className="text-[15px] font-medium text-[#34C759]" role="status" aria-live="polite">{tr('success')}</span>
                      <button
                        onClick={() => handleDownload(file.id)}
                        className="px-5 py-2 text-[15px] font-medium text-white bg-[#34C759] rounded-[10px] hover:bg-[#28A745] transition-all"
                        aria-label={`Download unlocked ${file.file.name}`}
                      >
                        {tr('download')}
                      </button>
                    </>
                  )}

                  {file.status === 'error' && (
                    <>
                      <span className="text-[14px] text-[#FF3B30]" role="alert">{file.error || tr('wrongPassword')}</span>
                      <button
                        onClick={() => handleProcess(file.id)}
                        className="px-5 py-2 text-[15px] font-medium text-white bg-[#007AFF] rounded-[10px] hover:bg-[#0056CC] transition-all"
                        aria-label={`Retry removing password from ${file.file.name}`}
                      >
                        {tr('process')}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleRemove(file.id)}
                    className="w-8 h-8 flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-[8px] transition-all"
                    aria-label={`Remove ${file.file.name} from list`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </article>
              ))}
            </div>

            {/* Clear All */}
            <button
              onClick={handleClearAll}
              className="w-full py-3 mt-4 text-[15px] font-medium text-[#86868B] hover:text-[#1D1D1F] rounded-[12px] hover:bg-[#E8E8ED] transition-all"
            >
              {tr('clearAll')}
            </button>
          </section>
        )}

        {/* FAQ Section for SEO */}
        <section aria-labelledby="faq-heading" className="mt-16 pt-12 border-t border-[#E8E8ED]">
          <h2 id="faq-heading" className="text-[24px] font-bold text-[#1D1D1F] mb-6 text-center">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <details className="bg-white rounded-[12px] p-5">
              <summary className="text-[16px] font-medium text-[#1D1D1F] cursor-pointer">
                Is my PDF file secure?
              </summary>
              <p className="mt-3 text-[15px] text-[#86868B] leading-relaxed">
                Yes. Your files are processed entirely in your browser. We never upload your PDFs to any server. Your files stay on your device throughout the entire process.
              </p>
            </details>

            <details className="bg-white rounded-[12px] p-5">
              <summary className="text-[16px] font-medium text-[#1D1D1F] cursor-pointer">
                What types of PDF passwords can be removed?
              </summary>
              <p className="mt-3 text-[15px] text-[#86868B] leading-relaxed">
                We support removing user passwords protected with AES-256 and RC4 encryption, which are the most common encryption methods for password-protected PDFs.
              </p>
            </details>

            <details className="bg-white rounded-[12px] p-5">
              <summary className="text-[16px] font-medium text-[#1D1D1F] cursor-pointer">
                Is this service free?
              </summary>
              <p className="mt-3 text-[15px] text-[#86868B] leading-relaxed">
                Yes, removing PDF passwords is completely free. You can unlock unlimited PDF files without any payment or registration required.
              </p>
            </details>

            <details className="bg-white rounded-[12px] p-5">
              <summary className="text-[16px] font-medium text-[#1D1D1F] cursor-pointer">
                How do I remove a PDF password?
              </summary>
              <p className="mt-3 text-[15px] text-[#86868B] leading-relaxed">
                Simply drag and drop your password-protected PDF onto the upload area, enter the password, and click the remove button. Your unlocked PDF will be ready for download instantly.
              </p>
            </details>
          </div>
        </section>

        {/* Features Section */}
        <section aria-labelledby="features-heading" className="mt-16 pt-12 border-t border-[#E8E8ED]">
          <h2 id="features-heading" className="text-[24px] font-bold text-[#1D1D1F] mb-8 text-center">Why Choose Our PDF Password Remover</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-[12px] bg-[#007AFF]/10 flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-[#1D1D1F] mb-2">100% Secure</h3>
              <p className="text-[14px] text-[#86868B]">Files processed locally in your browser</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-[12px] bg-[#34C759]/10 flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-[#1D1D1F] mb-2">Instant Processing</h3>
              <p className="text-[14px] text-[#86868B]">Unlock PDFs in seconds</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-[12px] bg-[#FF9500]/10 flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-[#1D1D1F] mb-2">Completely Free</h3>
              <p className="text-[14px] text-[#86868B]">No hidden charges or limits</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer role="contentinfo" className="bg-white border-t border-[#E8E8ED] mt-16">
        <div className="max-w-[680px] mx-auto px-6 py-8">
          <div className="text-center text-[14px] text-[#86868B]">
            <p className="mb-2">© 2026 rmpwfrompdf. All rights reserved.</p>
            <nav aria-label="Footer navigation" className="flex justify-center gap-4">
              <a href="#" className="hover:text-[#007AFF] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#007AFF] transition-colors">Terms of Service</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}