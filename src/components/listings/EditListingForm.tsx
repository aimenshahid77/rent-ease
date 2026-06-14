import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useListing, useUpdateListing } from '../../hooks/useListings';
import { listingsService } from '../../services/listings';
import { toast } from 'sonner';
import { Loader2, Upload, X, MapPin, DollarSign, Bed, Bath } from 'lucide-react';
import { PROPERTY_IMAGE_FALLBACK, setImageFallback } from '../../utils/imageFallbacks';

const editSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  monthly_rent: z.number().min(1, 'Monthly rent is required'),
  deposit: z.number().optional().or(z.literal(0)),
  bedrooms: z.number().optional().or(z.literal(0)),
  bathrooms: z.number().optional().or(z.literal(0)),
  availability_date: z.string().optional(),
  house_rules: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

type EditFormData = z.infer<typeof editSchema>;

const AMENITIES_LIST = [
  'WiFi', 'Parking', 'Air Conditioning', 'Heating', 'Laundry', 'Gym',
  'Swimming Pool', 'Balcony', 'Pet Friendly', 'Furnished', 'Kitchen',
  'Elevator', 'Security', 'Garden', 'Storage',
];

interface EditListingFormProps {
  listingId: string;
}

export const EditListingForm = ({ listingId }: EditListingFormProps) => {
  // Removed unused user
  const navigate = useNavigate();
  const { data: listing, isLoading } = useListing(listingId);
  const { mutateAsync: updateListing } = useUpdateListing();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { control, handleSubmit } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    values: listing ? {
      title: listing.title,
      description: listing.description || '',
      address: listing.address || '',
      city: listing.city || '',
      monthly_rent: listing.monthly_rent,
      deposit: listing.deposit || 0,
      bedrooms: listing.bedrooms || 0,
      bathrooms: listing.bathrooms || 0,
      availability_date: listing.availability_date || '',
      house_rules: listing.house_rules || '',
      amenities: listing.amenities || [],
    } : undefined,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewFiles(prev => [...prev, ...files]);
    const urls = files.map(f => URL.createObjectURL(f));
    setNewPreviews(prev => [...prev, ...urls]);
  };

  const handleDeleteExistingImage = async (imageId: string, storagePath: string) => {
    try {
      await listingsService.deleteListingImage(imageId, storagePath);
      toast.success('Image removed.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove image.');
    }
  };

  const onSubmit = async (data: EditFormData) => {
    setIsSubmitting(true);
    try {
      await updateListing({ id: listingId, updates: data });

      if (newFiles.length > 0) {
        const paths: string[] = [];
        for (const file of newFiles) {
          const path = await listingsService.uploadImage(file);
          paths.push(path);
        }
        await listingsService.addListingImages(listingId, paths);
      }

      toast.success('Listing updated! Pending re-approval.');
      navigate('/landlord/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-12 text-slate-400">Listing not found.</div>
    );
  }

  const existingImages = listing.images || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white">Edit Listing</h1>
        <p className="text-slate-400 text-sm mt-1">Changes will require re-approval by an admin.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Title</label>
        <Controller name="title" control={control} render={({ field, fieldState }) => (
          <div>
            <input {...field} className={`w-full px-4 py-2.5 bg-slate-900/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 ${fieldState.invalid ? 'border-destructive' : 'border-slate-800'}`} />
            {fieldState.invalid && <p className="text-xs text-destructive mt-1">{fieldState.error?.message}</p>}
          </div>
        )} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Description</label>
        <Controller name="description" control={control} render={({ field, fieldState }) => (
          <div>
            <textarea {...field} rows={5} className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${fieldState.invalid ? 'border-destructive' : 'border-slate-800'}`} />
            {fieldState.invalid && <p className="text-xs text-destructive mt-1">{fieldState.error?.message}</p>}
          </div>
        )} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Address</label>
          <Controller name="address" control={control} render={({ field, fieldState }) => (
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input {...field} className={`w-full pl-9 pr-4 py-2.5 bg-slate-900/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 ${fieldState.invalid ? 'border-destructive' : 'border-slate-800'}`} />
              {fieldState.invalid && <p className="text-xs text-destructive mt-1">{fieldState.error?.message}</p>}
            </div>
          )} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">City</label>
          <Controller name="city" control={control} render={({ field, fieldState }) => (
            <div>
              <input {...field} className={`w-full px-4 py-2.5 bg-slate-900/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 ${fieldState.invalid ? 'border-destructive' : 'border-slate-800'}`} />
              {fieldState.invalid && <p className="text-xs text-destructive mt-1">{fieldState.error?.message}</p>}
            </div>
          )} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-2 col-span-2">
          <label className="text-sm font-medium text-slate-300">Monthly Rent ($)</label>
          <Controller name="monthly_rent" control={control} render={({ field: { value, onChange, ...rest }, fieldState }) => (
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input {...rest} value={value} onChange={e => onChange(Number(e.target.value))} type="number" min="0" className={`w-full pl-9 pr-4 py-2.5 bg-slate-900/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 ${fieldState.invalid ? 'border-destructive' : 'border-slate-800'}`} />
              {fieldState.invalid && <p className="text-xs text-destructive mt-1">{fieldState.error?.message}</p>}
            </div>
          )} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Beds</label>
          <Controller name="bedrooms" control={control} render={({ field: { value, onChange, ...rest } }) => (
            <div className="relative">
              <Bed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input {...rest} value={value} onChange={e => onChange(Number(e.target.value))} type="number" min="0" className="w-full pl-9 pr-2 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          )} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Baths</label>
          <Controller name="bathrooms" control={control} render={({ field: { value, onChange, ...rest } }) => (
            <div className="relative">
              <Bath className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input {...rest} value={value} onChange={e => onChange(Number(e.target.value))} type="number" min="0" className="w-full pl-9 pr-2 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          )} />
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300">Amenities</label>
        <Controller name="amenities" control={control} render={({ field }) => (
          <div className="grid grid-cols-3 gap-2">
            {AMENITIES_LIST.map((amenity) => {
              const checked = (field.value || []).includes(amenity);
              return (
                <button key={amenity} type="button"
                  onClick={() => { const cur = field.value || []; field.onChange(checked ? cur.filter(a => a !== amenity) : [...cur, amenity]); }}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left ${checked ? 'border-primary bg-primary/10 text-primary' : 'border-slate-800 bg-slate-900/20 text-slate-400 hover:border-slate-700 hover:text-white'}`}
                >
                  {checked ? '✓ ' : ''}{amenity}
                </button>
              );
            })}
          </div>
        )} />
      </div>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-300">Current Photos</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {existingImages.map((img, idx) => (
              <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-800">
                <img src={listingsService.getImageUrl(img.storage_path)} alt="listing" className="w-full h-full object-cover" onError={(e) => setImageFallback(e, PROPERTY_IMAGE_FALLBACK)} />
                {idx === 0 && <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">COVER</div>}
                <button
                  type="button"
                  onClick={() => handleDeleteExistingImage(img.id, img.storage_path)}
                  className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Image Upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300">Add New Photos</label>
        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-700 hover:border-primary/50 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-primary/5 group">
          <Upload className="h-8 w-8 text-slate-600 group-hover:text-primary mx-auto mb-2 transition-colors" />
          <p className="text-slate-400 text-sm font-semibold">Click to add more photos</p>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
        </div>
        {newPreviews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {newPreviews.map((url, idx) => (
              <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-800">
                <img src={url} alt="new preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setNewFiles(p => p.filter((_, i) => i !== idx)); setNewPreviews(p => p.filter((_, i) => i !== idx)); }} className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
        <button type="button" onClick={() => navigate('/landlord/dashboard')} className="px-5 py-2.5 border border-slate-800 text-slate-300 hover:text-white font-semibold rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl cursor-pointer disabled:opacity-50">
          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};
