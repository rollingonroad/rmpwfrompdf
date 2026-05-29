'use client';

import { UploadedFile } from './FileUploader';
import { useI18n } from '@/i18n';

export function FileItem({
  file,
  onPasswordChange,
  onProcess,
  onDownload,
  onRemove,
}: {
  file: UploadedFile;
  onPasswordChange: (id: string, password: string) => void;
  onProcess: (id: string) => void;
  onDownload: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <div className="flex-1">
        <p className="font-medium truncate">{file.file.name}</p>
        <p className="text-sm text-gray-500">
          {(file.file.size / 1024).toFixed(1)} KB
        </p>
      </div>

      {file.status === 'pending' && (
        <>
          <input
            type="password"
            placeholder={t('passwordPlaceholder')}
            value={file.password}
            onChange={(e) => onPasswordChange(file.id, e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <button
            onClick={() => onProcess(file.id)}
            disabled={!file.password}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {t('process')}
          </button>
        </>
      )}

      {file.status === 'processing' && (
        <span className="text-gray-500">{t('processing')}</span>
      )}

      {file.status === 'success' && (
        <>
          <span className="text-green-600">{t('success')}</span>
          <button
            onClick={() => onDownload(file.id)}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            {t('download')}
          </button>
        </>
      )}

      {file.status === 'error' && (
        <>
          <span className="text-red-600">{file.error || t('error')}</span>
          <button
            onClick={() => onProcess(file.id)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {t('process')}
          </button>
        </>
      )}

      <button
        onClick={() => onRemove(file.id)}
        className="px-3 py-2 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </div>
  );
}