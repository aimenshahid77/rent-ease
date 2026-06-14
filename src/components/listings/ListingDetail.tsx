import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useListing, useCreateInquiry, useToggleSaveListing, useSavedListings } from '../../hooks/useListings';
import { useAuthStore } from '../../store/authStore';
import { ReviewList } from '../reviews/ReviewList';
import { ReviewForm } from '../reviews/ReviewForm';
import { listingsService } from '../../services/listings';
import { AVATAR_IMAGE_FALLBACK, PROPERTY_IMAGE_FALLBACK, setImageFallback } from '../../utils/imageFallbacks';
import {
  Bed,
  Bath,
  MapPin,
  Calendar,
  Heart,
  Mail,
  Loader2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

const inquirySchema = z.object({
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

interface ListingDetailProps {
  listingId: string;
}

export const ListingDetail = ({ listingId }: ListingDetailProps) => {
  const { user } = useAuthStore();
  const { data: listing, isLoading, error } = useListing(listingId);
  const { mutate: createInquiry, isPending: isInquiryPending } = useCreateInquiry();
  const { mutate: toggleSave } = useToggleSaveListing();

  // Selected Image index
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Form for inquiry
  const { control, handleSubmit, reset } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      message: 'Hi! I am very interested in this property. I would love to get details or schedule a viewing.',
    },
  });

  const { data: savedListings } = useSavedListings(user?.id || '');
  const isSaved = (savedListings || []).some((item) => item.listing_id === listingId);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse space-y-8">
        <div className="h-96 bg-slate-900 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="h-10 bg-slate-900 rounded w-2/3" />
            <div className="h-6 bg-slate-900 rounded w-1/3" />
            <div className="h-32 bg-slate-900 rounded" />
          </div>
          <div className="h-72 bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <h2 className="text-xl font-bold text-white">Listing Not Found</h2>
        <p className="text-slate-400 mt-2">The property listing you're looking for could not be found or has been deleted.</p>
      </div>
    );
  }

  const images = listing.images || [];
  const imageUrls =
    images.length > 0
      ? images.map((img) => listingsService.getImageUrl(img.storage_path))
      : [PROPERTY_IMAGE_FALLBACK];

  const handleInquirySubmit = (data: InquiryFormData) => {
    if (!user) {
      toastInfo('Please log in to contact landlords.');
      return;
    }
    createInquiry(
      { listing_id: listingId, tenant_id: user.id, message: data.message },
      {
        onSuccess: () => {
          reset();
        },
      }
    );
  };

  const handleToggleSave = () => {
    if (!user) return;
    toggleSave({ tenantId: user.id, listingId, isSaved });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Photo Gallery */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
        <div className="relative aspect-[21/9] w-full">
          <img
            src={imageUrls[activeImageIdx]}
            alt={listing.title}
            className="w-full h-full object-cover transition-all duration-300"
            onError={(e) => setImageFallback(e, PROPERTY_IMAGE_FALLBACK)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
        </div>

        {/* Thumbnail overlays */}
        {imageUrls.length > 1 && (
          <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
            {imageUrls.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`w-16 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  activeImageIdx === idx ? 'border-primary scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={url} alt="thumbnail" className="w-full h-full object-cover" onError={(e) => setImageFallback(e, PROPERTY_IMAGE_FALLBACK)} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Details + Contact Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Property Details */}
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-xs font-bold rounded-full uppercase tracking-wider">
                {listing.property_type}
              </span>
              <span className="text-sm text-slate-400 flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Available {listing.availability_date || 'Immediately'}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white">{listing.title}</h1>

            <div className="flex items-center gap-1.5 text-slate-400">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-base">{listing.address}, {listing.city}</span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 border-y border-slate-800/80 py-5 my-6 text-center">
              <div>
                <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">Monthly Rent</p>
                <p className="text-2xl font-black text-white mt-1">${listing.monthly_rent}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">Security Deposit</p>
                <p className="text-2xl font-black text-white mt-1">${listing.deposit || 0}</p>
              </div>
              <div className="flex justify-around items-center">
                <div className="text-left">
                  <div className="flex items-center gap-1 text-slate-200">
                    <Bed className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-bold">{listing.bedrooms || 0} Beds</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-200 mt-1">
                    <Bath className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-bold">{listing.bathrooms || 0} Baths</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-100">About this property</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap font-normal text-sm">
              {listing.description || 'No description provided.'}
            </p>
          </div>

          {/* Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-100">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listing.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-slate-900/40 border border-slate-850 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-slate-300 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* House Rules */}
          {listing.house_rules && (
            <div className="space-y-3 bg-slate-900/10 border border-slate-800 p-5 rounded-2xl">
              <h2 className="text-xl font-bold text-slate-100">House Rules</h2>
              <p className="text-slate-300 leading-relaxed text-sm font-normal whitespace-pre-wrap">
                {listing.house_rules}
              </p>
            </div>
          )}

          {/* Reviews Section */}
          <div className="border-t border-slate-800 pt-8 space-y-6">
            <h2 className="text-2xl font-bold text-white">Reviews</h2>
            <ReviewList listingId={listingId} />

            {/* Submit review section for tenants */}
            {user?.role === 'tenant' && (
              <ReviewForm listingId={listingId} tenantId={user.id} />
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          {/* Inquiry Form */}
          {user?.role !== 'landlord' && user?.role !== 'admin' && (
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-200">Contact Landlord</h3>
                {user?.role === 'tenant' && (
                  <button
                    onClick={handleToggleSave}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                      isSaved
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit(handleInquirySubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Controller
                    name="message"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div>
                        <textarea
                          {...field}
                          rows={5}
                          placeholder="Your message to the landlord..."
                          className={`w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${
                            fieldState.invalid ? 'border-destructive' : ''
                          }`}
                          disabled={isInquiryPending}
                        />
                        {fieldState.invalid && (
                          <p className="text-xs text-destructive mt-1 font-medium">{fieldState.error?.message}</p>
                        )}
                      </div>
                    )}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer text-sm"
                  disabled={isInquiryPending}
                >
                  {isInquiryPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending Inquiry...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send Inquiry
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Landlord Card Info */}
          <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl space-y-4">
            <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Listed By</h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-850 flex-shrink-0">
                <img
                  src={
                    listing.landlord?.avatar_url ||
                    'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=' + listing.landlord?.full_name
                  }
                  alt={listing.landlord?.full_name || 'Landlord'}
                  className="w-full h-full object-cover"
                  onError={(e) => setImageFallback(e, AVATAR_IMAGE_FALLBACK)}
                />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white truncate flex items-center gap-1.5">
                  {listing.landlord?.full_name || 'Landlord Info'}
                  {listing.landlord?.is_verified && (
                    <span title="Verified Landlord"><ShieldCheck className="h-4 w-4 text-primary" /></span>
                  )}
                </p>
                <p className="text-xs text-slate-400 capitalize">{listing.landlord?.role}</p>
              </div>
            </div>
            {listing.landlord?.bio && (
              <p className="text-xs text-slate-400 font-normal leading-relaxed italic">
                "{listing.landlord.bio}"
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock alert helper to avoid compile breaks
function toastInfo(msg: string) {
  toast.info(msg);
}
