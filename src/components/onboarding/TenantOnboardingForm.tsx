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
import type { OnboardingDocumentType, PropertyType } from '../../types';

const STEPS = ['About You', 'Preferences', 'Verification', 'Review'];

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'room', label: 'Room' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'studio', label: 'Studio' },
  { value: 'hostel', label: 'Hostel' },
];

const personalSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  occupation: z.string().min(2, 'Occupation is required'),
  monthly_income: z.number().min(0, 'Income must be positive'),
  reason_for_using: z.string().min(20, 'Please tell us more (at least 20 characters)'),
  cnic_number: z.string().optional(),
});

const preferencesSchema = z.object({
  preferred_city: z.string().min(2, 'City is required'),
  preferred_property_types: z.array(z.string()).min(1, 'Select at least one property type'),
  budget_min: z.number().min(0),
  budget_max: z.number().min(0),
  household_size: z.number().min(1),
  move_in_date: z.string().optional(),
}).refine((d) => d.budget_max >= d.budget_min, {
  message: 'Max budget must be greater than min',
  path: ['budget_max'],
});

type PersonalData = z.infer<typeof personalSchema>;
type PreferencesData = z.infer<typeof preferencesSchema>;

const documentSlots: DocumentSlot[] = [
  { type: 'cnic_front', label: 'CNIC — Front', description: 'Clear photo of the front side', required: true },
  { type: 'cnic_back', label: 'CNIC — Back', description: 'Clear photo of the back side', required: true },
  { type: 'character_certificate', label: 'Character Certificate', description: 'NADRA-approved character certificate', required: true },
  { type: 'profile_photo', label: 'Profile Photo', description: 'Optional profile picture', required: false },
];

export function TenantOnboardingForm() {
  const { user } = useAuthStore();
  const { saveTenant, isSavingTenant, uploadDocument, isUploadingDocument } = useOnboarding(user?.id, user?.role);
  const [step, setStep] = useState(1);
  const [personal, setPersonal] = useState<PersonalData | null>(null);
  const [preferences, setPreferences] = useState<PreferencesData | null>(null);
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

  const preferencesForm = useForm<PreferencesData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferred_city: '',
      preferred_property_types: [],
      budget_min: 0,
      budget_max: 0,
      household_size: 1,
      move_in_date: '',
    },
  });

  const handlePersonalNext = personalForm.handleSubmit((data) => {
    setPersonal(data);
    setStep(2);
  });

  const handlePreferencesNext = preferencesForm.handleSubmit((data) => {
    setPreferences(data);
    setStep(3);
  });

  const handleUpload = async (type: OnboardingDocumentType, file: File) => {
    await uploadDocument({ documentType: type, file });
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    setUploaded((prev) => ({ ...prev, [type]: { fileName: file.name, preview } }));
  };

  const requiredDocs = ['cnic_front', 'cnic_back', 'character_certificate'] as const;
  const docsComplete = requiredDocs.every((d) => uploaded[d]);

  const handleSubmit = async () => {
    if (!personal || !preferences) return;
    await saveTenant({
      full_name: personal.full_name,
      phone: personal.phone,
      occupation: personal.occupation,
      monthly_income: personal.monthly_income,
      reason_for_using: personal.reason_for_using,
      preferred_city: preferences.preferred_city,
      preferred_property_types: preferences.preferred_property_types as PropertyType[],
      budget_min: preferences.budget_min,
      budget_max: preferences.budget_max,
      household_size: preferences.household_size,
      move_in_date: preferences.move_in_date || null,
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
            {step === 1 && 'Tell us about yourself so we can personalize your experience.'}
            {step === 2 && 'What kind of rental are you looking for?'}
            {step === 3 && 'Verify your identity for a safe community.'}
            {step === 4 && 'Review your information before submitting.'}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handlePersonalNext} className="space-y-4">
            {(['full_name', 'phone', 'occupation'] as const).map((field) => (
              <div key={field}>
                <label className="text-sm font-medium text-slate-700 capitalize">
                  {field.replace('_', ' ')}
                </label>
                <Controller
                  name={field}
                  control={personalForm.control}
                  render={({ field: f, fieldState }) => (
                    <div className="mt-1">
                      <input {...f} className={`${inputClass} ${fieldState.invalid ? 'border-red-400' : ''}`} />
                      {fieldState.error && (
                        <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-slate-700">Monthly Income (PKR)</label>
              <Controller
                name="monthly_income"
                control={personalForm.control}
                render={({ field, fieldState }) => (
                  <div className="mt-1">
                    <input {...field} type="number" min={0} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} className={`${inputClass} ${fieldState.invalid ? 'border-red-400' : ''}`} />
                    {fieldState.error && <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
                  </div>
                )}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">CNIC Number (optional)</label>
              <Controller
                name="cnic_number"
                control={personalForm.control}
                render={({ field }) => (
                  <input {...field} placeholder="12345-1234567-1" className={`${inputClass} mt-1`} />
                )}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Why do you want to use RentEase?</label>
              <Controller
                name="reason_for_using"
                control={personalForm.control}
                render={({ field, fieldState }) => (
                  <div className="mt-1">
                    <textarea {...field} rows={4} placeholder="Tell us your reason and what you're looking for..." className={`${inputClass} resize-none ${fieldState.invalid ? 'border-red-400' : ''}`} />
                    {fieldState.error && <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
                  </div>
                )}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Continue
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handlePreferencesNext} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Preferred City</label>
              <Controller
                name="preferred_city"
                control={preferencesForm.control}
                render={({ field, fieldState }) => (
                  <div className="mt-1">
                    <input {...field} placeholder="e.g. Islamabad" className={`${inputClass} ${fieldState.invalid ? 'border-red-400' : ''}`} />
                    {fieldState.error && <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
                  </div>
                )}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Property Types</label>
              <Controller
                name="preferred_property_types"
                control={preferencesForm.control}
                render={({ field, fieldState }) => (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {propertyTypes.map((pt) => {
                      const selected = field.value.includes(pt.value);
                      return (
                        <button
                          key={pt.value}
                          type="button"
                          onClick={() => {
                            const next = selected
                              ? field.value.filter((v) => v !== pt.value)
                              : [...field.value, pt.value];
                            field.onChange(next);
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                            selected
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'bg-white border-2 border-primary/30 text-primary hover:bg-primary/5'
                          }`}
                        >
                          {pt.label}
                        </button>
                      );
                    })}
                    {fieldState.error && <p className="w-full text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
                  </div>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Budget Min (PKR)</label>
                <Controller name="budget_min" control={preferencesForm.control} render={({ field }) => (
                  <input {...field} type="number" min={0} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} className={`${inputClass} mt-1`} />
                )} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Budget Max (PKR)</label>
                <Controller name="budget_max" control={preferencesForm.control} render={({ field, fieldState }) => (
                  <div className="mt-1">
                    <input {...field} type="number" min={0} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} className={`${inputClass} ${fieldState.invalid ? 'border-red-400' : ''}`} />
                    {fieldState.error && <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>}
                  </div>
                )} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Household Size</label>
                <Controller name="household_size" control={preferencesForm.control} render={({ field }) => (
                  <input {...field} type="number" min={1} onChange={(e) => field.onChange(e.target.valueAsNumber || 1)} className={`${inputClass} mt-1`} />
                )} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Move-in Date</label>
                <Controller name="move_in_date" control={preferencesForm.control} render={({ field }) => (
                  <input {...field} type="date" className={`${inputClass} mt-1`} />
                )} />
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </Button>
              <Button type="submit" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Continue
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <DocumentUploadStep
              slots={documentSlots}
              uploaded={uploaded}
              onUpload={handleUpload}
              isUploading={isUploadingDocument}
            />
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </Button>
              <Button
                type="button"
                disabled={!docsComplete}
                onClick={() => setStep(4)}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Review
              </Button>
            </div>
          </div>
        )}

        {step === 4 && personal && preferences && (
          <div className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-900 mb-2">Personal Info</p>
                <p className="text-slate-600">Name: {personal.full_name}</p>
                <p className="text-slate-600">Phone: {personal.phone}</p>
                <p className="text-slate-600">Occupation: {personal.occupation}</p>
                <p className="text-slate-600">Income: PKR {personal.monthly_income.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-900 mb-2">Preferences</p>
                <p className="text-slate-600">City: {preferences.preferred_city}</p>
                <p className="text-slate-600">Types: {preferences.preferred_property_types.join(', ')}</p>
                <p className="text-slate-600">Budget: PKR {preferences.budget_min.toLocaleString()} – {preferences.budget_max.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="font-bold text-primary mb-1">Documents uploaded</p>
                <p className="text-sm text-slate-600">{Object.keys(uploaded).length} file(s) — pending admin review</p>
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(3)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSavingTenant}
                loading={isSavingTenant}
              >
                {isSavingTenant ? 'Submitting...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
