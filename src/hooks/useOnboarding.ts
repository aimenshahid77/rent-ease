import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  onboardingService,
  type LandlordOnboardingInput,
  type TenantOnboardingInput,
} from '../services/onboarding';
import type { OnboardingDocumentType, UserRole, VerificationStatus } from '../types';

export function useOnboardingStatus(userId?: string, role?: UserRole) {
  return useQuery({
    queryKey: ['onboarding-status', userId, role],
    queryFn: async () => {
      if (!userId || !role || role === 'admin') return true;
      return onboardingService.isComplete(userId, role);
    },
    enabled: !!userId && !!role && role !== 'admin',
  });
}

export function useApprovalStatus(userId?: string, role?: UserRole) {
  return useQuery<VerificationStatus>({
    queryKey: ['approval-status', userId, role],
    queryFn: async () => {
      if (!userId || !role || role === 'admin') return 'approved';
      return onboardingService.getVerificationStatus(userId, role);
    },
    enabled: !!userId && !!role && role !== 'admin',
    refetchInterval: 30_000,
  });
}

export function useAdminPendingOnboarding() {
  return useQuery({
    queryKey: ['admin-pending-onboarding'],
    queryFn: () => onboardingService.getPendingOnboardings(),
  });
}

export function useAdminUpdateVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      adminId, userId, role, status,
    }: {
      adminId: string;
      userId: string;
      role: UserRole;
      status: VerificationStatus;
    }) => onboardingService.adminUpdateVerificationStatus(adminId, userId, role, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['admin-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['approval-status'] });
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
    },
  });
}

export function useOnboarding(userId?: string, role?: UserRole) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['onboarding-status', userId, role] });
  };

  const saveTenantMutation = useMutation({
    mutationFn: (values: TenantOnboardingInput) => {
      if (!userId) throw new Error('Not authenticated');
      return onboardingService.saveTenant(userId, values);
    },
    onSuccess: () => {
      invalidate();
      toast.success('Profile setup complete! Welcome to RentEase.');
      navigate('/tenant/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save your profile.');
    },
  });

  const saveLandlordMutation = useMutation({
    mutationFn: (values: LandlordOnboardingInput) => {
      if (!userId) throw new Error('Not authenticated');
      return onboardingService.saveLandlord(userId, values);
    },
    onSuccess: () => {
      invalidate();
      toast.success('Profile setup complete! Welcome to RentEase.');
      navigate('/landlord/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save your profile.');
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: ({
      documentType,
      file,
    }: {
      documentType: OnboardingDocumentType;
      file: File;
    }) => {
      if (!userId || !role || role === 'admin') throw new Error('Not authenticated');
      return onboardingService.uploadDocument(userId, role, documentType, file);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload document.');
    },
  });

  return {
    saveTenant: saveTenantMutation.mutateAsync,
    isSavingTenant: saveTenantMutation.isPending,
    saveLandlord: saveLandlordMutation.mutateAsync,
    isSavingLandlord: saveLandlordMutation.isPending,
    uploadDocument: uploadDocumentMutation.mutateAsync,
    isUploadingDocument: uploadDocumentMutation.isPending,
  };
}
