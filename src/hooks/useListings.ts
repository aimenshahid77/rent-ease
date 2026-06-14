import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { listingsService } from '../services/listings';
import type { ListingStatus } from '../types';

export const useListings = (filters: {
  city?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
} = {}) => {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => listingsService.getListings(filters),
  });
};

export const useListing = (id: string) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsService.getListingById(id),
    enabled: !!id,
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listing, landlordId }: { listing: any; landlordId: string }) =>
      listingsService.createListing(listing, landlordId),
    onSuccess: () => {
      toast.success('Listing created successfully! Pending admin approval.');
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['landlord-listings'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create listing.');
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      listingsService.updateListing(id, updates),
    onSuccess: (data) => {
      toast.success('Listing updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', data.id] });
      queryClient.invalidateQueries({ queryKey: ['landlord-listings'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update listing.');
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listingsService.deleteListing(id),
    onSuccess: () => {
      toast.success('Listing deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['landlord-listings'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete listing.');
    },
  });
};

export const useCreateInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inquiry: { listing_id: string; tenant_id: string; message: string }) =>
      listingsService.createInquiry(inquiry),
    onSuccess: () => {
      toast.success('Inquiry sent successfully to the landlord!');
      queryClient.invalidateQueries({ queryKey: ['tenant-inquiries'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send inquiry.');
    },
  });
};

export const useTenantInquiries = (tenantId: string) => {
  return useQuery({
    queryKey: ['tenant-inquiries', tenantId],
    queryFn: () => listingsService.getTenantInquiries(tenantId),
    enabled: !!tenantId,
  });
};

export const useLandlordInquiries = (landlordId: string) => {
  return useQuery({
    queryKey: ['landlord-inquiries', landlordId],
    queryFn: () => listingsService.getLandlordInquiries(landlordId),
    enabled: !!landlordId,
  });
};

export const useReplyToInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ inquiryId, reply }: { inquiryId: string; reply: string }) =>
      listingsService.replyToInquiry(inquiryId, reply),
    onSuccess: () => {
      toast.success('Reply submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['landlord-inquiries'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit reply.');
    },
  });
};

export const useToggleSaveListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tenantId, listingId, isSaved }: { tenantId: string; listingId: string; isSaved: boolean }) =>
      listingsService.toggleSaveListing(tenantId, listingId, isSaved),
    onSuccess: (_, variables) => {
      toast.success(variables.isSaved ? 'Listing unsaved.' : 'Listing saved!');
      queryClient.invalidateQueries({ queryKey: ['saved-listings', variables.tenantId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update saved listings.');
    },
  });
};

export const useSavedListings = (tenantId: string) => {
  return useQuery({
    queryKey: ['saved-listings', tenantId],
    queryFn: () => listingsService.getSavedListings(tenantId),
    enabled: !!tenantId,
  });
};

export const useLandlordListings = (landlordId: string) => {
  return useQuery({
    queryKey: ['landlord-listings', landlordId],
    queryFn: () => listingsService.getLandlordListings(landlordId),
    enabled: !!landlordId,
  });
};

export const useAdminListings = () => {
  return useQuery({
    queryKey: ['admin-listings'],
    queryFn: () => listingsService.getAdminListings(),
  });
};

export const useAdminProfiles = () => {
  return useQuery({
    queryKey: ['admin-profiles'],
    queryFn: () => listingsService.getAdminProfiles(),
  });
};

export const useAdminLogs = () => {
  return useQuery({
    queryKey: ['admin-logs'],
    queryFn: () => listingsService.getAdminLogs(),
  });
};

export const useUpdateListingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adminId, listingId, status, reason }: { adminId: string; listingId: string; status: ListingStatus; reason?: string }) =>
      listingsService.updateListingStatus(adminId, listingId, status, reason),
    onSuccess: (data) => {
      toast.success(`Listing status updated to ${data.status}!`);
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update listing status.');
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adminId, targetUserId, newRole }: { adminId: string; targetUserId: string; newRole: 'tenant' | 'landlord' | 'admin' }) =>
      listingsService.updateUserRole(adminId, targetUserId, newRole),
    onSuccess: () => {
      toast.success('User role updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user role.');
    },
  });
};
