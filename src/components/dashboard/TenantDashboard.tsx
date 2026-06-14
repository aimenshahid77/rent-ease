import { useAuthStore } from '../../store/authStore';
import { useSavedListings, useTenantInquiries } from '../../hooks/useListings';
import { ListingCard } from '../listings/ListingCard';
import { Heart, MessageSquare, ExternalLink, Bookmark, ShieldAlert, ArrowRight, LayoutDashboard } from 'lucide-react';
import { ButtonLink } from '../ui/Button';

export const TenantDashboard = () => {
  const { user } = useAuthStore();
  const { data: savedListings, isLoading: isSavedLoading } = useSavedListings(user?.id || '');
  const { data: inquiries, isLoading: isInquiriesLoading } = useTenantInquiries(user?.id || '');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome, {user?.full_name?.split(' ')[0] || 'Tenant'}
            </h1>
          </div>
          <p className="text-slate-600 text-sm">Manage your bookmarks, track inquiry messages, and updates.</p>
        </div>
        <ButtonLink to="/tenant/profile" variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
          Edit Profile
        </ButtonLink>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Heart className="h-5 w-5 text-primary fill-primary/20" />
            <h2 className="text-xl font-bold text-slate-900">Saved Properties</h2>
          </div>

          {isSavedLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-64 border border-slate-200 shadow-sm" />
              ))}
            </div>
          ) : !savedListings || savedListings.length === 0 ? (
            <div className="text-center p-12 bg-white border border-dashed border-primary/30 rounded-2xl shadow-sm">
              <Bookmark className="h-10 w-10 text-primary/60 mx-auto mb-3" />
              <p className="text-slate-800 font-semibold">No saved listings yet</p>
              <p className="text-slate-500 text-sm mt-1 mb-5">Start browsing listings and tap the heart icon to save them.</p>
              <ButtonLink to="/listings" variant="primary" size="sm">
                Browse Properties
              </ButtonLink>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {savedListings.map((item) => (
                <ListingCard key={item.id} listing={item.listing as any} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Inquiry Messages</h2>
          </div>

          {isInquiriesLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl h-24 border border-slate-200 shadow-sm" />
              ))}
            </div>
          ) : !inquiries || inquiries.length === 0 ? (
            <div className="text-center p-8 bg-white border border-dashed border-primary/30 rounded-2xl shadow-sm">
              <ShieldAlert className="h-8 w-8 text-primary/60 mx-auto mb-2" />
              <p className="text-slate-800 text-sm font-semibold">No inquiries submitted</p>
              <p className="text-slate-500 text-xs mt-1">When you message a landlord, your history will show up here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 hover:border-primary/30 hover:shadow-md transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <ButtonLink
                      to={`/listings/${inq.listing_id}`}
                      variant="ghost"
                      size="sm"
                      className="!px-0 !min-h-0 text-xs font-bold"
                      rightIcon={<ExternalLink className="h-3 w-3" />}
                    >
                      <span className="truncate max-w-[140px]">{inq.listing?.title}</span>
                    </ButtonLink>
                    <span className="text-[10px] text-slate-500">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Your Message</p>
                      <p className="text-xs text-slate-600 italic line-clamp-2">&quot;{inq.message}&quot;</p>
                    </div>

                    {inq.landlord_reply ? (
                      <div className="bg-primary/5 p-2.5 rounded-lg border border-primary/20 mt-2">
                        <p className="text-[10px] uppercase font-bold text-primary">Landlord Reply</p>
                        <p className="text-xs text-slate-800 font-medium mt-0.5">{inq.landlord_reply}</p>
                        <span className="text-[9px] text-slate-500 mt-1 block">
                          Replied on {new Date(inq.replied_at || '').toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-block text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                        Awaiting landlord response
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
