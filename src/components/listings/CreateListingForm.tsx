import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCreateListing } from '../../hooks/useListings';
import { listingsService } from '../../services/listings';
import { toast } from 'sonner';
import {
  Home, MapPin, DollarSign, Bed, Bath, Calendar, FileText,
  Upload, X, ChevronRight, ChevronLeft, Loader2, Image, Plus, CheckCircle2
} from 'lucide-react';

const AMENITIES_LIST = [
  'WiFi', 'Parking', 'Air Conditioning', 'Heating', 'Laundry', 'Gym',
  'Swimming Pool', 'Balcony', 'Pet Friendly', 'Furnished', 'Kitchen',
  'Elevator', 'Security', 'Garden', 'Storage',
];

const step1Schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  property_type: z.enum(['room', 'apartment', 'house', 'studio']),
  description: z.string().min(20, 'Description must be at least 20 characters'),
});

const step2Schema = z.object({
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  monthly_rent: z.number().min(1, 'Monthly rent is required'),
  deposit: z.number().optional().or(z.literal(0)),
  bedrooms: z.number().optional().or(z.literal(0)),
  bathrooms: z.number().optional().or(z.literal(0)),
  availability_date: z.string().optional(),
});

const step3Schema = z.object({
  amenities: z.array(z.string()).optional(),
  house_rules: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

const STEPS = [
  { id: 1, label: 'Basic Info', icon: Home },
  { id: 2, label: 'Location & Price', icon: MapPin },
  { id: 3, label: 'Amenities', icon: FileText },
  { id: 4, label: 'Photos', icon: Image },
];

// Reusable styled label+error wrapper
const FormInput = ({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-700">
      {label}{required && <span className="text-secondary ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const inputClass = (invalid?: boolean) =>
  `w-full px-4 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm ${
    invalid ? 'border-red-400' : 'border-slate-200 hover:border-slate-300'
  }`;

export const CreateListingForm = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { mutateAsync: createListing } = useCreateListing();

  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [step3Data, setStep3Data] = useState<Step3Data | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: step1Data || { title: '', property_type: 'apartment', description: '' },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: step2Data || { address: '', city: '', monthly_rent: 0, deposit: 0, bedrooms: 1, bathrooms: 1 },
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: step3Data || { amenities: [], house_rules: '' },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (uploadedFiles.length + files.length > 10) {
      toast.error('Maximum 10 images allowed.');
      return;
    }
    setUploadedFiles((prev) => [...prev, ...files]);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...urls]);
  };

  const removeFile = (idx: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleStep1 = step1Form.handleSubmit((data) => { setStep1Data(data); setStep(2); });
  const handleStep2 = step2Form.handleSubmit((data) => { setStep2Data(data); setStep(3); });
  const handleStep3 = step3Form.handleSubmit((data) => { setStep3Data(data); setStep(4); });

  const handleFinalSubmit = async () => {
    if (!user || !step1Data || !step2Data) return;
    setIsSubmitting(true);
    try {
      const listing = await createListing({
        listing: {
          ...step1Data,
          ...step2Data,
          amenities: step3Data?.amenities || [],
          house_rules: step3Data?.house_rules || null,
          status: 'pending',
        },
        landlordId: user.id,
      });

      if (uploadedFiles.length > 0) {
        const paths: string[] = [];
        for (const file of uploadedFiles) {
          const path = await listingsService.uploadImage(file);
          paths.push(path);
        }
        await listingsService.addListingImages(listing.id, paths);
      }

      toast.success('Listing submitted for admin approval!');
      navigate('/landlord/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">
          Add <span className="text-secondary">New</span> Property
        </h1>
        <p className="text-slate-500 text-sm">Fill in your property details below. It will be reviewed by our admin team before going live.</p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${step >= s.id ? 'text-secondary' : 'text-slate-400'}`}>
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                step > s.id
                  ? 'bg-secondary border-secondary text-white'
                  : step === s.id
                  ? 'border-secondary text-secondary bg-orange-50'
                  : 'border-slate-200 text-slate-400 bg-white'
              }`}>
                {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : s.id}
              </div>
              <span className="hidden sm:block text-xs font-semibold">{s.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 rounded-full transition-all ${step > s.id ? 'bg-secondary' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Card Wrapper */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-6">
            <div className="mb-2">
              <h2 className="text-xl font-bold text-slate-900">Basic Information</h2>
              <p className="text-slate-500 text-sm mt-0.5">Tell us about your property.</p>
            </div>

            <FormInput label="Listing Title" required error={step1Form.formState.errors.title?.message}>
              <Controller name="title" control={step1Form.control} render={({ field, fieldState }) => (
                <input {...field} placeholder="e.g. Cozy 2-Bedroom Apartment in Downtown" className={inputClass(fieldState.invalid)} />
              )} />
            </FormInput>

            <FormInput label="Property Type" required>
              <Controller name="property_type" control={step1Form.control} render={({ field }) => (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['room', 'apartment', 'house', 'studio'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => field.onChange(type)}
                      className={`py-3 rounded-xl border text-sm font-semibold capitalize transition-all cursor-pointer ${
                        field.value === type
                          ? 'border-secondary bg-orange-50 text-secondary'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-secondary/50 hover:text-secondary'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )} />
            </FormInput>

            <FormInput label="Description" required error={step1Form.formState.errors.description?.message}>
              <Controller name="description" control={step1Form.control} render={({ field, fieldState }) => (
                <textarea {...field} rows={5} placeholder="Describe the property: layout, neighborhood, transport links..." className={inputClass(fieldState.invalid) + ' resize-none'} />
              )} />
            </FormInput>

            <div className="flex justify-end pt-2">
              <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl cursor-pointer transition-colors shadow-md shadow-secondary/20">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Location & Price */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="space-y-6">
            <div className="mb-2">
              <h2 className="text-xl font-bold text-slate-900">Location & Pricing</h2>
              <p className="text-slate-500 text-sm mt-0.5">Where is it and how much does it cost?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormInput label="Street Address" required error={step2Form.formState.errors.address?.message}>
                <Controller name="address" control={step2Form.control} render={({ field, fieldState }) => (
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input {...field} placeholder="123 Main Street" className={`${inputClass(fieldState.invalid)} pl-10`} />
                  </div>
                )} />
              </FormInput>

              <FormInput label="City" required error={step2Form.formState.errors.city?.message}>
                <Controller name="city" control={step2Form.control} render={({ field, fieldState }) => (
                  <input {...field} placeholder="e.g. Karachi" className={inputClass(fieldState.invalid)} />
                )} />
              </FormInput>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormInput label="Monthly Rent (PKR)" required error={step2Form.formState.errors.monthly_rent?.message}>
                <Controller name="monthly_rent" control={step2Form.control} render={({ field: { value, onChange, ...rest }, fieldState }) => (
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input {...rest} value={value} onChange={e => onChange(Number(e.target.value))} type="number" min="0" placeholder="25000" className={`${inputClass(fieldState.invalid)} pl-10`} />
                  </div>
                )} />
              </FormInput>

              <FormInput label="Security Deposit (PKR)">
                <Controller name="deposit" control={step2Form.control} render={({ field: { value, onChange, ...rest } }) => (
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input {...rest} value={value} onChange={e => onChange(Number(e.target.value))} type="number" min="0" placeholder="50000" className={`${inputClass()} pl-10`} />
                  </div>
                )} />
              </FormInput>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <FormInput label="Bedrooms">
                <Controller name="bedrooms" control={step2Form.control} render={({ field: { value, onChange, ...rest } }) => (
                  <div className="relative">
                    <Bed className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input {...rest} value={value} onChange={e => onChange(Number(e.target.value))} type="number" min="0" className={`${inputClass()} pl-10`} />
                  </div>
                )} />
              </FormInput>

              <FormInput label="Bathrooms">
                <Controller name="bathrooms" control={step2Form.control} render={({ field: { value, onChange, ...rest } }) => (
                  <div className="relative">
                    <Bath className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input {...rest} value={value} onChange={e => onChange(Number(e.target.value))} type="number" min="0" className={`${inputClass()} pl-10`} />
                  </div>
                )} />
              </FormInput>

              <FormInput label="Available From">
                <Controller name="availability_date" control={step2Form.control} render={({ field }) => (
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input {...field} type="date" className={`${inputClass()} pl-10`} />
                  </div>
                )} />
              </FormInput>
            </div>

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 hover:text-slate-900 font-semibold rounded-xl cursor-pointer transition-colors">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl cursor-pointer transition-colors shadow-md shadow-secondary/20">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Amenities & Rules */}
        {step === 3 && (
          <form onSubmit={handleStep3} className="space-y-6">
            <div className="mb-2">
              <h2 className="text-xl font-bold text-slate-900">Amenities & House Rules</h2>
              <p className="text-slate-500 text-sm mt-0.5">Select what's available and set your expectations.</p>
            </div>

            <FormInput label="Amenities">
              <Controller name="amenities" control={step3Form.control} render={({ field }) => (
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {AMENITIES_LIST.map((amenity) => {
                    const checked = (field.value || []).includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => {
                          const current = field.value || [];
                          field.onChange(checked ? current.filter(a => a !== amenity) : [...current, amenity]);
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left ${
                          checked
                            ? 'border-secondary bg-orange-50 text-secondary'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-secondary/50'
                        }`}
                      >
                        {checked ? '✓ ' : ''}{amenity}
                      </button>
                    );
                  })}
                </div>
              )} />
            </FormInput>

            <FormInput label="House Rules (Optional)">
              <Controller name="house_rules" control={step3Form.control} render={({ field }) => (
                <textarea {...field} rows={4} placeholder="e.g. No smoking, no parties, quiet hours after 10pm..." className={`${inputClass()} resize-none`} />
              )} />
            </FormInput>

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 hover:text-slate-900 font-semibold rounded-xl cursor-pointer transition-colors">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl cursor-pointer transition-colors shadow-md shadow-secondary/20">
                Next: Photos <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Photo Upload */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="mb-2">
              <h2 className="text-xl font-bold text-slate-900">Upload Photos</h2>
              <p className="text-slate-500 text-sm mt-0.5">Add up to 10 high-quality photos. First photo will be the cover.</p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-secondary/50 rounded-2xl p-12 text-center cursor-pointer transition-all hover:bg-orange-50/30 group"
            >
              <Upload className="h-10 w-10 text-slate-300 group-hover:text-secondary mx-auto mb-3 transition-colors" />
              <p className="text-slate-700 font-semibold">Click to upload photos</p>
              <p className="text-slate-400 text-sm mt-1">PNG, JPG, WEBP up to 10MB each</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
            </div>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <div className="absolute top-1 left-1 bg-secondary text-white text-[9px] font-bold px-1.5 py-0.5 rounded">COVER</div>
                    )}
                    <button
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-secondary/50 flex items-center justify-center cursor-pointer transition-all hover:bg-orange-50/30"
                >
                  <Plus className="h-6 w-6 text-slate-400" />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button type="button" onClick={() => setStep(3)} className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 hover:text-slate-900 font-semibold rounded-xl cursor-pointer transition-colors">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50 transition-colors shadow-md shadow-secondary/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  'Submit Listing'
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
