import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, ShieldCheck, Square } from 'lucide-react';
import type { Listing, ListingImage, Profile } from '../../types';
import { listingsService } from '../../services/listings';
import { useAuthStore } from '../../store/authStore';
import { useToggleSaveListing, useSavedListings } from '../../hooks/useListings';
import { PROPERTY_IMAGE_FALLBACK, setImageFallback } from '../../utils/imageFallbacks';

interface ListingCardProps {
  listing: Listing & { landlord?: Profile; images?: ListingImage[] };
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  const { user } = useAuthStore();
  const isTenant = user?.role === 'tenant';

  const { data: savedListings } = useSavedListings(user?.id || '');
  const isSaved = (savedListings || []).some((item) => item.listing_id === listing.id);

  const { mutate: toggleSave } = useToggleSaveListing();

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    toggleSave({ tenantId: user.id, listingId: listing.id, isSaved });
  };

  const firstImageUrl =
    listing.images && listing.images.length > 0
      ? listingsService.getImageUrl(listing.images[0].storage_path)
      : PROPERTY_IMAGE_FALLBACK;

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={firstImageUrl}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => setImageFallback(e, PROPERTY_IMAGE_FALLBACK)}
        />
        {/* Property type badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
            {listing.property_type}
          </span>
        </div>

        {/* Bookmark */}
        {isTenant && (
          <button
            onClick={handleSave}
            className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all cursor-pointer shadow-sm ${
              isSaved
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-slate-400 hover:text-red-400'
            }`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
          <MapPin className="h-3.5 w-3.5 text-secondary shrink-0" />
          <span className="truncate">{listing.address}, {listing.city}</span>
        </div>

        {/* Title */}
        <Link to={`/listings/${listing.id}`} className="block mb-3">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 hover:text-primary transition-colors text-base line-clamp-1">
            {listing.title}
          </h3>
        </Link>

        {/* Price */}
        <p className="text-secondary font-bold text-xl mb-4">
          ${listing.monthly_rent.toLocaleString()}
          <span className="text-slate-400 text-sm font-normal">/Month</span>
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-4 mt-auto">
          {listing.bedrooms && (
            <div className="flex items-center gap-1.5">
              <Bed className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>{listing.bedrooms} Bed</span>
            </div>
          )}
          {listing.bathrooms && (
            <div className="flex items-center gap-1.5">
              <Bath className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>{listing.bathrooms} Bath</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Square className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span>Furnished</span>
          </div>
          {listing.landlord?.is_verified && (
            <div className="flex items-center gap-1 text-primary text-xs ml-auto" title="Verified Landlord">
              <ShieldCheck className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

