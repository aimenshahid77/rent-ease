import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../services/auth';
import { onboardingService } from '../services/onboarding';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setUser, setSession, logout } = useAuthStore();

  const signUpMutation = useMutation({
    mutationFn: ({ email, password, fullName, role }: { email: string; password: string; fullName: string; role: UserRole }) =>
      authService.signUp(email, password, fullName, role),
    onSuccess: (data) => {
      if (data.session && data.profile) {
        setUser(data.profile);
        setSession(data.session);
        toast.success('Registration successful! Welcome to RentEase.');
        navigateAfterAuth(data.profile, navigate);
      } else {
        toast.success('Registration received. Please verify your email, then sign in.');
        navigate('/login');
      }
    },
    onError: (error: any) => {
      const message = error.message || '';
      if (message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('too many')) {
        toast.error('Email rate limit reached. Wait about an hour, or disable email confirmation in Supabase for development.');
      } else {
        toast.error(message || 'Registration failed. Please try again.');
      }
    },
  });

  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signIn(email, password),
    onSuccess: (data) => {
      setUser(data.profile);
      setSession(data.session);
      toast.success(`Welcome back, ${data.profile.full_name || 'User'}!`);
      navigateAfterAuth(data.profile, navigate);
    },
    onError: (error: any) => {
      const message = error.message || '';
      if (message.toLowerCase().includes('email not confirmed') || message.toLowerCase().includes('not verified')) {
        toast.error('Please verify your email first. Use "Resend verification" on the login page.');
      } else {
        toast.error(message || 'Sign in failed. Check your credentials.');
      }
    },
  });

  const signOutMutation = useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Signed out successfully.');
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error signing out.');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: any }) =>
      authService.updateProfile(userId, updates),
    onSuccess: (updatedProfile) => {
      setUser(updatedProfile);
      toast.success('Profile updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['profile', updatedProfile.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile.');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ email }: { email: string }) => authService.sendPasswordReset(email),
    onSuccess: () => {
      toast.success('Password reset email sent. Check your inbox.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send password reset email.');
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: ({ email }: { email: string }) => authService.resendVerificationEmail(email),
    onSuccess: () => {
      toast.success('Verification email sent. Check your inbox and spam folder.');
    },
    onError: (error: any) => {
      const message = error.message || '';
      if (message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('too many')) {
        toast.error('Email rate limit reached. Please wait about an hour, or confirm your email manually in Supabase Dashboard.');
      } else {
        toast.error(message || 'Failed to resend verification email.');
      }
    },
  });

  return {
    signUp: signUpMutation.mutate,
    isSignUpPending: signUpMutation.isPending,
    signIn: signInMutation.mutate,
    isSignInPending: signInMutation.isPending,
    signOut: signOutMutation.mutate,
    isSignOutPending: signOutMutation.isPending,
    updateProfile: updateProfileMutation.mutate,
    isUpdateProfilePending: updateProfileMutation.isPending,
    resetPassword: resetPasswordMutation.mutate,
    isResetPasswordPending: resetPasswordMutation.isPending,
    resendVerification: resendVerificationMutation.mutate,
    isResendVerificationPending: resendVerificationMutation.isPending,
  };
};

export const useAuthSession = () => {
  const { setUser, setSession, setLoading, logout } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    const syncSession = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session?.user) {
        if (!cancelled) logout();
        return;
      }

      try {
        const profile = await authService.ensureProfile(session.user);
        if (!cancelled) {
          setUser(profile);
          setSession(session);
          setLoading(false);
        }
      } catch {
        if (!cancelled) logout();
      }
    };

    syncSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        logout();
        return;
      }

      setSession(session);
      setTimeout(() => {
        authService.ensureProfile(session.user)
          .then((profile) => {
            if (!cancelled) {
              setUser(profile);
              setLoading(false);
            }
          })
          .catch(() => {
            if (!cancelled) logout();
          });
      }, 0);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [logout, setLoading, setSession, setUser]);
};

async function navigateAfterAuth(profile: { id: string; role: UserRole }, navigate: ReturnType<typeof useNavigate>) {
  if (profile.role !== 'admin') {
    const completed = await onboardingService.isComplete(profile.id, profile.role);
    if (!completed) {
      navigate('/onboarding');
      return;
    }
  }

  navigateToRoleDashboard(profile.role, navigate);
}

function navigateToRoleDashboard(role: UserRole, navigate: ReturnType<typeof useNavigate>) {
  if (role === 'landlord') {
    navigate('/landlord/dashboard');
  } else if (role === 'admin') {
    navigate('/admin/dashboard');
  } else {
    navigate('/tenant/dashboard');
  }
}
