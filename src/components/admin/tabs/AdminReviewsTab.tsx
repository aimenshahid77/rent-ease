import { Eye, EyeOff, Star } from 'lucide-react';
import { AdminEmptyState } from '../shared/AdminEmptyState';
import type { Review, Profile } from '../../../types';

type AdminReview = Review & { tenant?: Profile; listing?: { title: string; id: string } };

interface AdminReviewsTabProps {
  reviews: AdminReview[] | undefined;
  adminId: string;
  onToggleVisibility: (args: { adminId: string; reviewId: string; isHidden: boolean }) => void;
}

export const AdminReviewsTab = ({ reviews, adminId, onToggleVisibility }: AdminReviewsTabProps) => (
  <div className="space-y-4">
    <div>
      <h2 className="text-lg font-bold text-foreground">Moderate Reviews</h2>
      <p className="text-sm text-muted-foreground mt-0.5">Hide or restore user submitted reviews</p>
    </div>

    {!reviews || reviews.length === 0 ? (
      <div className="bg-white dark:bg-slate-800 border border-border rounded-2xl">
        <AdminEmptyState icon={Star} title="No reviews found" body="No reviews have been submitted yet." />
      </div>
    ) : (
      <div className="space-y-3">
        {reviews.map(review => (
          <div
            key={review.id}
            className={`p-5 bg-white dark:bg-slate-800 border rounded-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
              review.is_hidden
                ? 'border-red-200 dark:border-red-400/20 opacity-70'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`h-3.5 w-3.5 ${idx < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">{review.rating} out of 5</span>
                {review.is_hidden && (
                  <span className="text-[10px] text-red-700 dark:text-red-400 font-bold border border-red-300 dark:border-red-400/30 bg-red-100 dark:bg-red-400/10 px-2 py-0.5 rounded-full">
                    Hidden
                  </span>
                )}
              </div>
              {review.comment && (
                <p className="text-sm text-foreground line-clamp-2">&ldquo;{review.comment}&rdquo;</p>
              )}
              <p className="text-xs text-muted-foreground">
                By {review.tenant?.full_name || 'Unknown'} &middot; Listing: {review.listing?.title || 'Unknown'}
              </p>
            </div>
            <button
              onClick={() => onToggleVisibility({ adminId, reviewId: review.id, isHidden: !review.is_hidden })}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-colors shrink-0 ${
                review.is_hidden
                  ? 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-400/10 dark:hover:bg-emerald-400/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-400/30'
                  : 'bg-red-100 hover:bg-red-200 dark:bg-red-400/10 dark:hover:bg-red-400/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-400/30'
              }`}
            >
              {review.is_hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {review.is_hidden ? 'Show Review' : 'Hide Review'}
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);
