import { useRef, useState } from 'react';
import { Camera, CheckCircle2, FileUp, Loader2, ShieldCheck, Upload } from 'lucide-react';
import type { OnboardingDocumentType } from '../../types';
import { Button } from '../ui/Button';

export interface DocumentSlot {
  type: OnboardingDocumentType;
  label: string;
  description: string;
  required?: boolean;
}

interface DocumentUploadStepProps {
  slots: DocumentSlot[];
  uploaded: Partial<Record<OnboardingDocumentType, { fileName: string; preview?: string }>>;
  onUpload: (type: OnboardingDocumentType, file: File) => Promise<void>;
  isUploading: boolean;
}

export function DocumentUploadStep({ slots, uploaded, onUpload, isUploading }: DocumentUploadStepProps) {
  const [activeSlot, setActiveSlot] = useState<OnboardingDocumentType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSlot) return;
    await onUpload(activeSlot, file);
    setActiveSlot(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openPicker = (type: OnboardingDocumentType) => {
    setActiveSlot(type);
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
        <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-slate-900">Identity Verification</h3>
          <p className="text-sm text-slate-600 mt-1">
            Upload your CNIC (front &amp; back) and your NADRA-approved character certificate.
            Documents are reviewed by our team before your account is fully verified.
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {slots.map((slot) => {
          const done = uploaded[slot.type];
          return (
            <div
              key={slot.type}
              className={`relative p-5 rounded-2xl border-2 transition-all duration-200 ${
                done
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-dashed border-slate-200 bg-white hover:border-primary/40 hover:bg-primary/[0.02]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{slot.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{slot.description}</p>
                </div>
                {done && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
              </div>

              {done?.preview && (
                <img
                  src={done.preview}
                  alt={slot.label}
                  className="w-full h-28 object-cover rounded-xl mb-3 border border-slate-200"
                />
              )}

              {done && !done.preview && (
                <div className="flex items-center gap-2 text-xs text-slate-600 mb-3 p-2 bg-slate-50 rounded-lg">
                  <FileUp className="h-4 w-4 text-primary" />
                  <span className="truncate">{done.fileName}</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={done ? 'outline' : 'primary'}
                  size="sm"
                  className="flex-1"
                  disabled={isUploading}
                  leftIcon={
                    isUploading && activeSlot === slot.type ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )
                  }
                  onClick={() => openPicker(slot.type)}
                >
                  {done ? 'Replace' : 'Upload'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  leftIcon={<Camera className="h-4 w-4" />}
                  onClick={() => openPicker(slot.type)}
                  aria-label={`Scan ${slot.label}`}
                >
                  Scan
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
