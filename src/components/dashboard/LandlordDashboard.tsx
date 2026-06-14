import { useAuthStore } from '../../store/authStore';
import { useLandlordListings, useDeleteListing, useUpdateListing } from '../../hooks/useListings';
import { listingsService } from '../../services/listings';
import {
  Plus, Eye, Edit, Trash2, Home, TrendingUp, Clock, CheckCircle, XCircle, PauseCircle, BarChart3
} from 'lucide-react';
import type { Listing, ListingImage } from '../../types';
import { PROPERTY_IMAGE_FALLBACK, setImageFallback } from '../../utils/imageFallbacks';
import { ButtonLink } from '../ui/Button';
import { Link } from 'react-router-dom';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
  active: { label: 'Active', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle },
  rented: { label: 'Rented', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Home },
  paused: { label: 'Paused', color: 'text-slate-600 bg-slate-50 border-slate-200', icon: PauseCircle },
  rejected: { label: 'Rejected', color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
  deleted: { label: 'Deleted', color: 'text-slate-400 bg-slate-50 border-slate-200', icon: Trash2 },
};

export const LandlordDashboard = () => {
  const { user } = useAuthStore();
  const { data: listings, isLoading } = useLandlordListings(user?.id || '');
  const { mutate: deleteListing } = useDeleteListing();
  const { mutate: updateListing } = useUpdateListing();

  const stats = {
    total: listings?.length || 0,
    active: listings?.filter((l) => l.status === 'active').length || 0,
    pending: listings?.filter((l) => l.status === 'pending').length || 0,
    rented: listings?.filter((l) => l.status === 'rented').length || 0,
    totalViews: listings?.reduce((acc, l) => acc + (l.views_count || 0), 0) || 0,
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      deleteListing(id);
    }
  };

  const handleTogglePause = (listing: Listing & { images: ListingImage[] }) => {
    const newStatus = listing.status === 'paused' ? 'active' : 'paused';
    updateListing({ id: listing.id, updates: { status: newStatus } });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Landlord Dashboard</h1>
          <p className="text-slate-600 text-sm mt-1">Manage your property listings and track performance.</p>
        </div>
        <ButtonLink to="/landlord/listings/new" variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
          New Listing
        </ButtonLink>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Listings', value: stats.total, icon: Home, color: 'text-primary' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-emerald-600' },
          { label: 'Pending Approval', value: stats.pending, icon: Clock, color: 'text-amber-600' },
          { label: 'Rented Out', value: stats.rented, icon: TrendingUp, color: 'text-blue-600' },
          { label: 'Total Views', value: stats.totalViews, icon: BarChart3, color: 'text-primary' },
        ].map((stat) => (
          <div key={stat.label} className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
            <div className={stat.color}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <Home className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-slate-900">Your Listings</h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-20 bg-white rounded-xl border border-slate-200" />
            ))}
          </div>
        ) : !listings || listings.length === 0 ? (
          <div className="text-center p-12 bg-white border border-dashed border-primary/30 rounded-2xl shadow-sm">
            <Home className="h-12 w-12 text-primary/50 mx-auto mb-3" />
            <p className="text-slate-800 font-bold text-lg">No listings yet</p>
            <p className="text-slate-500 text-sm mt-1 mb-5">Create your first property listing to get started.</p>
            <ButtonLink to="/landlord/listings/new" variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
              Create First Listing
            </ButtonLink>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-primary/5 text-xs uppercase text-primary tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-bold">Property</th>
                  <th className="px-4 py-3 hidden md:table-cell font-bold">Type</th>
                  <th className="px-4 py-3 font-bold">Rent</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 hidden sm:table-cell font-bold">Views</th>
                  <th className="px-4 py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((listing) => {
                  const status = statusConfig[listing.status] || statusConfig['pending'];
                  const StatusIcon = status.icon;
                  const thumb =
                    listing.images && listing.images.length > 0
                      ? listingsService.getImageUrl(listing.images[0].storage_path)
                      : PROPERTY_IMAGE_FALLBACK;

                  return (
                    <tr key={listing.id} className="hover:bg-primary/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={thumb}
                            alt={listing.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                            onError={(e) => setImageFallback(e, PROPERTY_IMAGE_FALLBACK)}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-[160px]">{listing.title}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[160px]">{listing.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="capitalize text-slate-600">{listing.property_type}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">${listing.monthly_rent}/mo</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 border rounded-full text-xs font-bold ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-slate-600">{listing.views_count || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/listings/${listing.id}`}
                            className="p-2 text-primary hover:bg-primary/10 transition-colors rounded-lg cursor-pointer"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/landlord/listings/${listing.id}/edit`}
                            className="p-2 text-primary hover:bg-primary/10 transition-colors rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          {(listing.status === 'active' || listing.status === 'paused') && (
                            <button
                              onClick={() => handleTogglePause(listing)}
                              className={`p-2 transition-colors rounded-lg cursor-pointer ${
                                listing.status === 'paused'
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-amber-600 hover:bg-amber-50'
                              }`}
                              title={listing.status === 'paused' ? 'Resume' : 'Pause'}
                            >
                              <PauseCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(listing.id)}
                            className="p-2 text-red-500 hover:bg-red-50 transition-colors rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
