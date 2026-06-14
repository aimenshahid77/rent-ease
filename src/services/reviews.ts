import { supabase } from './supabase';
import type { Review, Profile } from '../types';

export const reviewsService = {
  async getReviewsForListing(listingId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, tenant:profiles(*)')
      .eq('listing_id', listingId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Review & { tenant: Profile })[];
  },

  async createReview(review: { listing_id: string; tenant_id: string; rating: number; comment: string }) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },

  async updateReview(id: string, updates: Partial<Omit<Review, 'id' | 'listing_id' | 'tenant_id'>>) {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },

  // Admin moderation reviews
  async getAdminReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, tenant:profiles(*), listing:listings(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Review & { tenant: Profile; listing: { title: string; id: string } })[];
  },

  async toggleReviewVisibility(adminId: string, reviewId: string, isHidden: boolean) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ is_hidden: isHidden })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;

    // Log the moderation action
    await supabase.from('audit_logs').insert({
      admin_id: adminId,
      action: isHidden ? 'hide_review' : 'show_review',
      target_type: 'review',
      target_id: reviewId,
      notes: `Set is_hidden = ${isHidden}`,
    });

    return data as Review;
  }
};
