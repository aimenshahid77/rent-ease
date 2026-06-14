import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reviewsService } from '../services/reviews';

export const useReviews = (listingId: string) => {
  return useQuery({
    queryKey: ['reviews', listingId],
    queryFn: () => reviewsService.getReviewsForListing(listingId),
    enabled: !!listingId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (review: { listing_id: string; tenant_id: string; rating: number; comment: string }) =>
      reviewsService.createReview(review),
    onSuccess: (data) => {
      toast.success('Review submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['reviews', data.listing_id] });
      queryClient.invalidateQueries({ queryKey: ['listing', data.listing_id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit review.');
    },
  });
};

export const useAdminReviews = () => {
  return useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => reviewsService.getAdminReviews(),
  });
};

export const useToggleReviewVisibility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adminId, reviewId, isHidden }: { adminId: string; reviewId: string; isHidden: boolean }) =>
      reviewsService.toggleReviewVisibility(adminId, reviewId, isHidden),
    onSuccess: () => {
      toast.success('Review visibility updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to moderate review.');
    },
  });
};
