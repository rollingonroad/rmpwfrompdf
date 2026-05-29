'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useI18n } from '@/i18n';

export interface UploadedFile {
  id: string;
  file: File;
  password: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  result?: ArrayBuffer;
  error?: string;
}

export function FileUploader({
  files,
  setFiles,
}: {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}) {
  const { t } = useI18n();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      password: '',
      status: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}"
    >
      <input {...getInputProps()} />
      <p className="text-gray-600">{isDragActive ? t('dropzone') : t('dropzone')}</p>
    </div>
  );
}