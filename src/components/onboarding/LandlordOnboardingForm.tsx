import { useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useOnboarding } from '../../hooks/useOnboarding';
import { OnboardingProgress } from './OnboardingProgress';
import { DocumentUploadStep, type DocumentSlot } from './DocumentUploadStep';
import { Button } from '../ui/Button';
import type { OnboardingDocumentType } from '../../types';

const STEPS = ['About You', 'Your Listings', 'Verification', 'Review'];

const personalSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  occupation: z.string().min(2, 'Occupation is required'),
  monthly_income: z.number().min(0, 'Income must be positive'),
  reason_for_using: z.string().min(20, 'Please tell us more (at least 20 characters)'),
  cnic_number: z.string().optional(),
});

const listingSchema = z.object({
  ownership_status: z.string().min(2, 'Required'),
  listing_intent: z.string().min(2, 'Required'),
  property_city: z.string().min(2, 'City is required'),
  expected_listings_count: z.number().min(1),
});

type PersonalData = z.infer<typeof personalSchema>;
type ListingData = z.infer<typeof listingSchema>;

const documentSlots: DocumentSlot[] = [
  { type: 'cnic_front', label: 'CNIC — Front', description: 'Clear photo of the front side', required: true },
  { type: 'cnic_back', label: 'CNIC — Back', description: 'Clear photo of the back side', required: true },
  { type: 'character_certificate', label: 'Character Certificate', description: 'NADRA-approved character certificate', required: true },
  { type: 'property_reference_photo', label: 'Property Photos', description: 'Sample photos of properties you plan to list', required: false },
];

export function LandlordOnboardingForm() {
  const { user } = useAuthStore();
  const { saveLandlord, isSavingLandlord, uploadDocument, isUploadingDocument } = useOnboarding(user?.id, user?.role);
  const [step, setStep] = useState(1);
  const [personal, setPersonal] = useState<PersonalData | null>(null);
  const [listing, setListing] = useState<ListingData | null>(null);
  const [uploaded, setUploaded] = useState<
    Partial<Record<OnboardingDocumentType, { fileName: string; preview?: string }>>
  >({});

  const personalForm = useForm<PersonalData>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      occupation: '',
      monthly_income: 0,
      reason_for_using: '',
      cnic_number: '',
    },
  });

  const listingForm = useForm<ListingData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      ownership_status: '',
      listing_intent: '',
      property_city: '',
      expected_listings_count: 1,
    },
  });

  const handleUpload = async (type: OnboardingDocumentType, file: File) => {
    await uploadDocument({ documentType: type, file });
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    setUploaded((prev) => ({ ...prev, [type]: { fileName: file.name, preview } }));
  };

  const requiredDocs = ['cnic_front', 'cnic_back', 'character_certificate'] as const;
  const docsComplete = requiredDocs.every((d) => uploaded[d]);

  const handleSubmit = async () => {
    if (!personal || !listing) return;
    await saveLandlord({
      full_name: personal.full_name,
      phone: personal.phone,
      occupation: personal.occupation,
      monthly_income: personal.monthly_income,
      reason_for_using: personal.reason_for_using,
      ownership_status: listing.ownership_status,
      listing_intent: listing.listing_intent,
      property_city: listing.property_city,
      expected_listings_count: listing.expected_listings_count,
      cnic_number: personal.cnic_number || null,
    });
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all';

  return (
    <div className="w-full max-w-2xl mx-auto">
      <OnboardingProgress steps={STEPS} currentStep={step} />

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Get Started with RentEase</h2>
          <p className="text-sm text-slate-500 mt-1">
            {step === 1 && 'Tell us about yourself and why you want to list properties.'}
            {step === 2 && 'Share details about your properties and listing plans.'}
            {step === 3 && 'Verify your identity for a trusted landlord profile.'}
            {step === 4 && 'Review your information before submitting.'}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={personalForm.handleSubmit((d) => { setPersonal(d); setStep(2); })} className="space-y-4">
            {(['full_name', 'phone', 'occupation'] as const).map((field) => (
              <div key={field}>
                <label className="text-sm font-medium text-slate-700 capitalize">{field.replace('_', ' ')}</label>
                <Controller
                  name={field}
                  control={personalForm.control}
                  render={({ field: f, fieldState }) => (
                    <div className="mt-1">
                      <input {...f} className={`${inputClass} ${fieldState.invalid ? 'border-red-400' : ''}`} />
                      {fieldState.error && <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
                    </div>
                  )}
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-slate-700">Monthly Income (PKR)</label>
              <Controller name="monthly_income" control={personalForm.control} render={({ field, fieldState }) => (
                <div className="mt-1">
                  <input {...field} type="number" min={0} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} className={`${inputClass} ${fieldState.invalid ? 'border-red-400' : ''}`} />
                  {fieldState.error && <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
                </div>
              )} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">CNIC Number (optional)</label>
              <Controller name="cnic_number" control={personalForm.control} render={({ field }) => (
                <input {...field} placeholder="12345-1234567-1" className={`${inputClass} mt-1`} />
              )} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Why do you want to use RentEase?</label>
              <Controller name="reason_for_using" control={personalForm.control} render={({ field, fieldState }) => (
                <div className="mt-1">
                  <textarea {...field} rows={4} placeholder="Tell us your motivation for listing properties..." className={`${inputClass} resize-none ${fieldState.invalid ? 'border-red-400' : ''}`} />
                  {fieldState.error && <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
                </div>
              )} />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" rightIcon={<ArrowRight className="h-4 w-4" />}>Continue</Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={listingForm.handleSubmit((d) => { setListing(d); setStep(3); })} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Ownership Status</label>
              <Controller name="ownership_status" control={listingForm.control} render={({ field, fieldState }) => (
                <div className="mt-1">
                  <select {...field} className={`${inputClass} ${fieldState.invalid ? 'border-red-400' : ''}`}>
                    <option value="">Select...</option>
                    <option value="owner">Property Owner</option>
                    <option value="agent">Real Estate Agent</option>
                    <option value="manager">Property Manager</option>
                  </select>
                  {fieldState.error && <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
                </div>
              )} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Listing Intent</label>
              <Controller name="listing_intent" control={listingForm.control} render={({ field, fieldState }) => (
                <div className="mt-1">
                  <select {...field} className={`${inputClass} ${fieldState.invalid ? 'border-red-400' : ''}`}>
                    <option value="">Select...</option>
                    <option value="long-term">Long-term Rentals</option>
                    <option value="short-term">Short-term / Monthly</option>
                    <option value="both">Both</option>
                  </select>
                  {fieldState.error && <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
                </div>
              )} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Property City</label>
              <Controller name="property_city" control={listingForm.control} render={({ field, fieldState }) => (
                <div className="mt-1">
                  <input {...field} placeholder="e.g. Lahore" className={`${inputClass} ${fieldState.invalid ? 'border-red-400' : ''}`} />
                  {fieldState.error && <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
                </div>
              )} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Expected Number of Listings</label>
              <Controller name="expected_listings_count" control={listingForm.control} render={({ field, fieldState }) => (
                <div className="mt-1">
                  <input {...field} type="number" min={1} onChange={(e) => field.onChange(e.target.valueAsNumber || 1)} className={`${inputClass} ${fieldState.invalid ? 'border-red-400' : ''}`} />
                  {fieldState.error && <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
                </div>
              )} />
            </div>
            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
              <Button type="submit" rightIcon={<ArrowRight className="h-4 w-4" />}>Continue</Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <DocumentUploadStep slots={documentSlots} uploaded={uploaded} onUpload={handleUpload} isUploading={isUploadingDocument} />
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
              <Button type="button" disabled={!docsComplete} onClick={() => setStep(4)} rightIcon={<ArrowRight className="h-4 w-4" />}>Review</Button>
            </div>
          </div>
        )}

        {step === 4 && personal && listing && (
          <div className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-900 mb-2">Personal Info</p>
                <p className="text-slate-600">Name: {personal.full_name}</p>
                <p className="text-slate-600">Occupation: {personal.occupation}</p>
                <p className="text-slate-600">Income: PKR {personal.monthly_income.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-900 mb-2">Listing Plans</p>
                <p className="text-slate-600">Status: {listing.ownership_status}</p>
                <p className="text-slate-600">Intent: {listing.listing_intent}</p>
                <p className="text-slate-600">City: {listing.property_city}</p>
                <p className="text-slate-600">Expected listings: {listing.expected_listings_count}</p>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="font-bold text-primary mb-1">Documents uploaded</p>
                <p className="text-sm text-slate-600">{Object.keys(uploaded).length} file(s) — pending admin review</p>
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(3)} leftIcon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
              <Button onClick={handleSubmit} disabled={isSavingLandlord} loading={isSavingLandlord}>
                {isSavingLandlord ? 'Submitting...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
