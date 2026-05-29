'use client';

import { useState } from 'react';
import { I18nProvider, useI18n, Language } from '@/i18n';
import { FileUploader } from '@/components/FileUploader';
import { FileItem } from '@/components/FileItem';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface UploadedFile {
  id: string;
  file: File;
  password: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  result?: ArrayBuffer;
  error?: string;
}

function HomeContent() {
  const { t } = useI18n();
  const [files, setFiles] = useState<UploadedFile[]>([]);

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
        const error = await response.json();
        throw new Error(error.error || 'Failed to process PDF');
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

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top banner for Google AdSense */}
      <div className="w-full bg-gray-200 py-4 text-center text-gray-500">
        {t('adPlaceholder')}
      </div>

      {/* Header with language switcher */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">{t('title')}</h1>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-gray-600 mb-8 text-center">{t('description')}</p>

        <FileUploader files={files} setFiles={setFiles} />

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">
                {t('fileList')} ({files.length})
              </h2>
              <div className="flex gap-2">
                {files.some((f) => f.status === 'success') && (
                  <button
                    onClick={handleDownloadAll}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                  >
                    {t('downloadAll')}
                  </button>
                )}
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                >
                  {t('clearAll')}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {files.map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  onPasswordChange={handlePasswordChange}
                  onProcess={handleProcess}
                  onDownload={handleDownload}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer banner for Google AdSense */}
      <div className="w-full bg-gray-200 py-4 text-center text-gray-500 mt-8">
        {t('adPlaceholder')}
      </div>
    </div>
  );
}

export default function Home() {
  const [locale] = useState<Language>('en');

  return (
    <I18nProvider locale={locale}>
      <HomeContent />
    </I18nProvider>
  );
}