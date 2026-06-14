import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateReview } from "../../hooks/useReviews";
import { Star, Loader2 } from "lucide-react";

const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: z.string().min(5, "Review comment must be at least 5 characters"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  listingId: string;
  tenantId: string;
}

export const ReviewForm = ({ listingId, tenantId }: ReviewFormProps) => {
  const { mutate: createReview, isPending } = useCreateReview();

  const { control, handleSubmit, reset } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    createReview(
      {
        listing_id: listingId,
        tenant_id: tenantId,
        rating: data.rating,
        comment: data.comment,
      },
      {
        onSuccess: () => {
          reset();
        },
      },
    );
  };

  return (
    // Replaced hardcoded bg-white/border-slate-800 with CSS theme variables
    <div className="bg-card text-card-foreground border border-border p-6 rounded-2xl transition-colors duration-200">
      <h3 className="text-lg font-bold mb-4">Write a Review</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Star Rating Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Your Rating
          </label>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => field.onChange(star)}
                    className="p-1 text-yellow-500 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        field.value >= star
                          ? "fill-current"
                          : "text-slate-400 dark:text-slate-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        {/* Comment field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Comment
          </label>
          <Controller
            name="comment"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <textarea
                  {...field}
                  rows={4}
                  placeholder="Share your experience staying here..."
                  // Cleaned up textareas to use muted backgrounds and borders that change smoothly across themes
                  className={`w-full p-3 bg-muted/50 border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-colors ${
                    fieldState.invalid ? "border-destructive" : ""
                  }`}
                  disabled={isPending}
                />
                {fieldState.invalid && (
                  <p className="text-xs text-destructive mt-1 font-medium">
                    {fieldState.error?.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <button
          type="submit"
          className="py-2.5 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </button>
      </form>
    </div>
  );
};
