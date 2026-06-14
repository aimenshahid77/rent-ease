import { useReviews } from '../../hooks/useReviews';
import { Star, MessageSquare } from 'lucide-react';

interface ReviewListProps {
  listingId: string;
}

export const ReviewList = ({ listingId }: ReviewListProps) => {
  const { data: reviews, isLoading } = useReviews(listingId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse bg-slate-900/30 border border-slate-800 p-4 rounded-xl h-24" />
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl text-center">
        <MessageSquare className="h-8 w-8 text-slate-600 mb-2" />
        <p className="text-slate-400 text-sm font-medium">No reviews yet for this listing.</p>
        <p className="text-slate-500 text-xs mt-1">Be the first to share your experience!</p>
      </div>
    );
  }

  // Calculate Average Rating
  const averageRating = (
    reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <div className="flex items-center gap-4 bg-slate-900/20 border border-slate-800 p-4 rounded-xl">
        <div className="flex flex-col items-center justify-center bg-slate-950 p-4 rounded-xl border border-slate-800 aspect-square min-w-[80px]">
          <span className="text-2xl font-black text-white">{averageRating}</span>
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Rating</span>
        </div>
        <div>
          <h4 className="font-bold text-slate-200">Verified Reviews</h4>
          <p className="text-slate-400 text-sm mt-0.5">Based on {reviews.length} reviews from RentEase tenants.</p>
        </div>
      </div>

      {/* Reviews Loop */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-200">
                  {review.tenant?.full_name || 'Tenant'}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(review.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Stars display */}
              <div className="flex text-yellow-500">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`h-4 w-4 ${
                      idx < review.rating ? 'fill-current' : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
