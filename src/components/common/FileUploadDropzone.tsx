import React, { useRef, useState } from 'react';
import { FileText, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';

export interface UploadedFilePreview {
  id: string;
  name: string;
  sizeLabel: string;
  isImage: boolean;
  previewUrl?: string;
}

interface FileUploadDropzoneProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  files: UploadedFilePreview[];
  onChange: (files: UploadedFilePreview[]) => void;
  helperText?: string;
  error?: string;
}

export function FileUploadDropzone({
  label,
  accept = '.pdf,.png,.jpg,.jpeg,.zip,.fig,.md,.txt',
  multiple = true,
  files,
  onChange,
  helperText = 'Supports PDF, PNG, JPG, ZIP, and documentation files up to 25 MB each.',
  error,
}: FileUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleFileSelection = (selectedList: FileList | null) => {
    if (!selectedList || selectedList.length === 0) return;

    setUploadProgress(25);
    window.setTimeout(() => setUploadProgress(70), 120);
    window.setTimeout(() => {
      const mapped: UploadedFilePreview[] = Array.from(selectedList).map((file, idx) => {
        const isImage = file.type.startsWith('image/');
        const sizeKb = Math.max(1, Math.round(file.size / 1024));
        const sizeLabel =
          sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
        return {
          id: `up-${Date.now()}-${idx}`,
          name: file.name,
          sizeLabel,
          isImage,
          previewUrl: isImage ? URL.createObjectURL(file) : undefined,
        };
      });
      onChange(multiple ? [...files, ...mapped] : mapped);
      setUploadProgress(null);
    }, 260);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileSelection(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    onChange(files.filter((f) => f.id !== id));
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">{label}</label>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center transition-colors ${
          error
            ? 'border-[#DC2626] bg-red-50/40'
            : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#2563EB] hover:bg-blue-50/30'
        }`}
      >
        <UploadCloud className="h-6 w-6 text-[#2563EB]" />
        <p className="mt-2 text-sm font-medium text-[#0F172A]">
          Click to upload or drag files here
        </p>
        <p className="mt-1 text-xs text-[#64748B]">{helperText}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFileSelection(e.target.files)}
        />
      </div>

      {uploadProgress !== null && (
        <div className="mt-2">
          <div className="mb-1 flex justify-between text-xs text-[#64748B]">
            <span>Preparing file preview...</span>
            <span className="font-mono tabular-nums">{uploadProgress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-[#2563EB] transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                {file.previewUrl ? (
                  <img
                    src={file.previewUrl}
                    alt={file.name}
                    className="h-9 w-9 shrink-0 rounded object-cover border border-[#E2E8F0]"
                  />
                ) : file.isImage ? (
                  <ImageIcon className="h-4 w-4 shrink-0 text-[#2563EB]" />
                ) : (
                  <FileText className="h-4 w-4 shrink-0 text-[#64748B]" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#0F172A]">{file.name}</p>
                  <p className="font-mono text-xs text-[#64748B] tabular-nums">{file.sizeLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                aria-label={`Remove ${file.name}`}
                className="rounded p-1.5 text-[#64748B] hover:bg-red-50 hover:text-[#DC2626]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
