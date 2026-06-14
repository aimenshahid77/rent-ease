import { useState } from 'react';
import { CheckCircle, XCircle, Search, ListChecks } from 'lucide-react';
import { AdminEmptyState } from '../shared/AdminEmptyState';
import { AdminStatusBadge } from '../shared/AdminStatusBadge';
import { listingsService } from '../../../services/listings';
import { PROPERTY_IMAGE_FALLBACK, setImageFallback } from '../../../utils/imageFallbacks';
import type { Listing, ListingImage, Profile } from '../../../types';

type AdminListing = Listing & { landlord?: Profile; images?: ListingImage[] };

interface AdminListingsTabProps {
  listings: AdminListing[] | undefined;
  isLoading: boolean;
  adminId: string;
  onUpdateStatus: (args: { adminId: string; listingId: string; status: any; reason?: string }) => void;
}

export const AdminListingsTab = ({ listings, isLoading, adminId, onUpdateStatus }: AdminListingsTabProps) => {
  const [search, setSearch] = useState('');
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = (listings || []).filter(l =>
    !search ||
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    (l.city || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">All Listings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Review, approve or reject property listings</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground w-60"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse border border-border" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-border rounded-2xl">
          <AdminEmptyState icon={ListChecks} title="No listings found" body="No listings match your search." />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((listing) => {
            const isExpanded = expandedId === listing.id;
            const thumbPath = listing.images && listing.images.length > 0
              ? listing.images[0].storage_path
              : null;
            const thumbUrl = thumbPath ? listingsService.getImageUrl(thumbPath) : null;

            return (
              <div
                key={listing.id}
                className="bg-white dark:bg-slate-800 border border-border hover:border-primary/30 rounded-2xl overflow-hidden transition-colors"
              >
                {/* Summary row */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : listing.id)}
                    className="flex items-start gap-3 min-w-0 flex-1 text-left cursor-pointer"
                  >
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={listing.title}
                        className="w-14 h-14 rounded-xl object-cover border border-border shrink-0"
                        onError={(e) => setImageFallback(e, PROPERTY_IMAGE_FALLBACK)}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 border border-border shrink-0 flex items-center justify-center text-muted-foreground text-xs">
                        No img
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-foreground truncate">{listing.title}</p>
                        <AdminStatusBadge status={listing.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {listing.city} &middot; ${listing.monthly_rent.toLocaleString()}/mo &middot; By {(listing as any).landlord?.full_name || 'Unknown'}
                      </p>
                      {listing.rejection_reason && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                          Rejection reason: {listing.rejection_reason}
                        </p>
                      )}
                      <p className="text-xs text-primary mt-1 font-medium">{isExpanded ? 'Click to collapse' : 'Click to view full details'}</p>
                    </div>
                  </button>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {listing.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus({ adminId, listingId: listing.id, status: 'active' })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-400/10 dark:hover:bg-emerald-400/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-400/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </button>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={rejectionReason[listing.id] || ''}
                            onChange={e => setRejectionReason(prev => ({ ...prev, [listing.id]: e.target.value }))}
                            placeholder="Reason for rejection..."
                            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-border text-foreground text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 w-44"
                          />
                          <button
                            onClick={() => onUpdateStatus({ adminId, listingId: listing.id, status: 'rejected', reason: rejectionReason[listing.id] })}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-400/10 dark:hover:bg-red-400/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-400/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      </>
                    )}
                    {listing.status === 'active' && (
                      <button
                        onClick={() => onUpdateStatus({ adminId, listingId: listing.id, status: 'paused' })}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border border-border rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Pause
                      </button>
                    )}
                    {listing.status === 'paused' && (
                      <button
                        onClick={() => onUpdateStatus({ adminId, listingId: listing.id, status: 'active' })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-400/10 dark:hover:bg-emerald-400/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-400/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Reactivate
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded detail panel */}
                {isExpanded && (
                  <div className="border-t border-border px-5 py-5 bg-slate-50 dark:bg-slate-700/30 space-y-5">
                    {/* Photo gallery */}
                    {listing.images && listing.images.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Photos</p>
                        <div className="flex gap-3 flex-wrap">
                          {listing.images.map((img, idx) => (
                            <img
                              key={img.id}
                              src={listingsService.getImageUrl(img.storage_path)}
                              alt={`Photo ${idx + 1}`}
                              className="w-28 h-20 object-cover rounded-xl border border-border"
                              onError={(e) => setImageFallback(e, PROPERTY_IMAGE_FALLBACK)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Core details grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Type</p>
                        <p className="font-semibold text-foreground capitalize mt-0.5">{listing.property_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Monthly Rent</p>
                        <p className="font-semibold text-foreground mt-0.5">${listing.monthly_rent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Deposit</p>
                        <p className="font-semibold text-foreground mt-0.5">${listing.deposit?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Bedrooms / Bathrooms</p>
                        <p className="font-semibold text-foreground mt-0.5">{listing.bedrooms ?? 0} bd / {listing.bathrooms ?? 0} ba</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">City</p>
                        <p className="font-semibold text-foreground mt-0.5">{listing.city || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Address</p>
                        <p className="font-semibold text-foreground mt-0.5 truncate">{listing.address || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Available From</p>
                        <p className="font-semibold text-foreground mt-0.5">{listing.availability_date || 'Immediately'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Views</p>
                        <p className="font-semibold text-foreground mt-0.5">{listing.views_count}</p>
                      </div>
                    </div>

                    {/* Description */}
                    {listing.description && (
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                      </div>
                    )}

                    {/* Amenities */}
                    {listing.amenities && listing.amenities.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-2">
                          {listing.amenities.map(a => (
                            <span key={a} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg">{a}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* House rules */}
                    {listing.house_rules && (
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">House Rules</p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{listing.house_rules}</p>
                      </div>
                    )}

                    {/* Landlord */}
                    {(listing as any).landlord && (
                      <div className="flex items-center gap-3 pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground font-medium">Listed by</p>
                        <p className="text-sm font-bold text-foreground">{(listing as any).landlord.full_name}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
