import { useReviews } from "../../hooks/useReviews";
import { Star, MessageSquare } from "lucide-react";

interface ReviewListProps {
  listingId: string;
}

export const ReviewList = ({ listingId }: ReviewListProps) => {
  const { data: reviews, isLoading } = useReviews(listingId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            // Replaced slate specific skeletons with standard variable muted targets
            className="animate-pulse bg-muted/60 border border-border p-4 rounded-xl h-24"
          />
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted/20 border border-dashed border-border rounded-2xl text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground/60 mb-2" />
        <p className="text-muted-foreground text-sm font-medium">
          No reviews yet for this listing.
        </p>
        <p className="text-muted-foreground/70 text-xs mt-1">
          Be the first to share your experience!
        </p>
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
      <div className="flex items-center gap-4 bg-muted/40 border border-border p-4 rounded-xl transition-colors duration-200">
        <div className="flex flex-col items-center justify-center bg-card p-4 rounded-xl border border-border aspect-square min-w-[80px]">
          <span className="text-2xl font-black text-foreground">
            {averageRating}
          </span>
          <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
            Rating
          </span>
        </div>
        <div>
          <h4 className="font-bold text-foreground">Verified Reviews</h4>
          <p className="text-muted-foreground text-sm mt-0.5">
            Based on {reviews.length} reviews from RentEase tenants.
          </p>
        </div>
      </div>

      {/* Reviews Loop */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            // Styled loop item cards safely using theme configurations instead of dark-hardcoded slate boundaries
            className="p-5 bg-card border border-border rounded-xl space-y-2 hover:border-muted-foreground/30 transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  {review.tenant?.full_name || "Tenant"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Stars display */}
              <div className="flex text-yellow-500">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`h-4 w-4 ${
                      idx < review.rating
                        ? "fill-current"
                        : "text-slate-300 dark:text-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-foreground/90 leading-relaxed font-normal">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
