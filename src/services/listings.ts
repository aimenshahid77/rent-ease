import { supabase } from './supabase';
import type { Listing, ListingImage, ListingStatus, SavedListing, Inquiry, Profile, AuditLog } from '../types';

export const listingsService = {
  // Fetch active listings with search filters
  async getListings(filters: {
    city?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
  }) {
    let query = supabase
      .from('listings')
      .select('*, landlord:profiles(*), images:listing_images(*)')
      .eq('status', 'active');

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.propertyType && filters.propertyType !== 'all') {
      query = query.eq('property_type', filters.propertyType);
    }
    if (filters.minPrice !== undefined) {
      query = query.gte('monthly_rent', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('monthly_rent', filters.maxPrice);
    }
    if (filters.bedrooms !== undefined && filters.bedrooms > 0) {
      query = query.gte('bedrooms', filters.bedrooms);
    }

    // Sort by newest
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data as (Listing & { landlord: Profile; images: ListingImage[] })[];
  },

  async getListingById(id: string) {
    // Increment views count asynchronously
    supabase.rpc('increment_views', { listing_id: id }).then(() => {}, () => {});

    const { data, error } = await supabase
      .from('listings')
      .select('*, landlord:profiles(*), images:listing_images(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as (Listing & { landlord: Profile; images: ListingImage[] });
  },

  async createListing(listing: Omit<Listing, 'id' | 'landlord_id' | 'views_count' | 'created_at' | 'updated_at'>, landlordId: string) {
    const { data, error } = await supabase
      .from('listings')
      .insert({
        ...listing,
        landlord_id: landlordId,
        status: 'pending', // Default to pending for admin approval
      })
      .select()
      .single();

    if (error) throw error;
    return data as Listing;
  },

  async updateListing(id: string, updates: Partial<Listing>) {
    const { data, error } = await supabase
      .from('listings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Listing;
  },

  async deleteListing(id: string) {
    // Delete images from storage first (optional, but clean)
    const { data: images } = await supabase
      .from('listing_images')
      .select('storage_path')
      .eq('listing_id', id);

    if (images && images.length > 0) {
      for (const img of images) {
        await this.deleteImageFromStorage(img.storage_path);
      }
    }

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Image Upload Functions
  async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `listings/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    return filePath;
  },

  async deleteImageFromStorage(path: string) {
    const { error } = await supabase.storage
      .from('listing-images')
      .remove([path]);
    if (error) throw error;
  },

  getImageUrl(path: string): string {
    const { data } = supabase.storage
      .from('listing-images')
      .getPublicUrl(path);
    return data.publicUrl;
  },

  async addListingImages(listingId: string, imagePaths: string[]) {
    const inserts = imagePaths.map((path, idx) => ({
      listing_id: listingId,
      storage_path: path,
      display_order: idx,
    }));

    const { error } = await supabase
      .from('listing_images')
      .insert(inserts);

    if (error) throw error;
  },

  async deleteListingImage(imageId: string, storagePath: string) {
    // Delete from storage
    await this.deleteImageFromStorage(storagePath);

    // Delete from table
    const { error } = await supabase
      .from('listing_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
  },

  // Inquiries
  async createInquiry(inquiry: { listing_id: string; tenant_id: string; message: string }) {
    const { data, error } = await supabase
      .from('inquiries')
      .insert(inquiry)
      .select()
      .single();

    if (error) throw error;
    return data as Inquiry;
  },

  async getTenantInquiries(tenantId: string) {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, listing:listings(*, images:listing_images(*))')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Inquiry & { listing: Listing & { images: ListingImage[] } })[];
  },

  async getLandlordInquiries(landlordId: string) {
    // Fetch inquiries where listing's landlord_id = landlordId
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, listing:listings(*), tenant:profiles(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter by landlord_id client-side because of RLS policies if complex joins are needed
    // or rely on policies. Let's filter on listing landlord_id:
    const landlordInquiries = (data || []).filter((inq: any) => inq.listing?.landlord_id === landlordId);
    return landlordInquiries as (Inquiry & { listing: Listing; tenant: Profile })[];
  },

  async replyToInquiry(inquiryId: string, reply: string) {
    const { data, error } = await supabase
      .from('inquiries')
      .update({
        landlord_reply: reply,
        replied_at: new Date().toISOString(),
        is_read: true,
      })
      .eq('id', inquiryId)
      .select()
      .single();

    if (error) throw error;
    return data as Inquiry;
  },

  // Saved Listings
  async toggleSaveListing(tenantId: string, listingId: string, isSaved: boolean) {
    if (isSaved) {
      const { error } = await supabase
        .from('saved_listings')
        .delete()
        .eq('tenant_id', tenantId)
        .eq('listing_id', listingId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('saved_listings')
        .insert({ tenant_id: tenantId, listing_id: listingId });
      if (error) throw error;
    }
  },

  async getSavedListings(tenantId: string) {
    const { data, error } = await supabase
      .from('saved_listings')
      .select('*, listing:listings(*, images:listing_images(*))')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return data as (SavedListing & { listing: Listing & { images: ListingImage[] } })[];
  },

  // Landlord Dashboard Stats and Listings
  async getLandlordListings(landlordId: string) {
    const { data, error } = await supabase
      .from('listings')
      .select('*, images:listing_images(*)')
      .eq('landlord_id', landlordId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Listing & { images: ListingImage[] })[];
  },

  // Admin Dashboard Actions
  async getAdminListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('*, landlord:profiles(*), images:listing_images(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Listing & { landlord: Profile; images: ListingImage[] })[];
  },

  async getAdminProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Profile[];
  },

  async updateListingStatus(adminId: string, listingId: string, status: ListingStatus, reason?: string) {
    const { data, error } = await supabase
      .from('listings')
      .update({
        status,
        rejection_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .select()
      .single();

    if (error) throw error;

    // Create Audit Log
    const { error: logError } = await supabase
      .from('audit_logs')
      .insert({
        admin_id: adminId,
        action: `updated_status_${status}`,
        target_type: 'listing',
        target_id: listingId,
        notes: reason ? `Reason: ${reason}` : `Status changed to ${status}`,
      });

    if (logError) console.error('Failed to write audit log:', logError);

    return data as Listing;
  },

  async updateUserRole(adminId: string, targetUserId: string, newRole: 'tenant' | 'landlord' | 'admin') {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', targetUserId)
      .select()
      .single();

    if (error) throw error;

    // Write audit log
    await supabase.from('audit_logs').insert({
      admin_id: adminId,
      action: 'update_user_role',
      target_type: 'profile',
      target_id: targetUserId,
      notes: `Changed role to ${newRole}`,
    });

    return data as Profile;
  },

  async getAdminLogs() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, admin:profiles(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (AuditLog & { admin: Profile })[];
  }
};
