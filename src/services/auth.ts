import { supabase } from './supabase';
import type { Profile, UserRole } from '../types';
import type { User } from '@supabase/supabase-js';

function profileFromUser(user: User): Profile {
  const metadata = user.user_metadata || {};
  const role = metadata.role === 'landlord' || metadata.role === 'admin' ? metadata.role : 'tenant';

  return {
    id: user.id,
    role,
    full_name: metadata.full_name || metadata.name || user.email || null,
    avatar_url: metadata.avatar_url || null,
    bio: null,
    phone: null,
    is_verified: !!user.email_confirmed_at,
    created_at: user.created_at || new Date().toISOString(),
  };
}

export const authService = {
  async signUp(email: string, password: string, fullName: string, role: UserRole) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user data returned from sign up.');

    const profile = data.session ? await this.ensureProfile(data.user) : null;
    return { user: data.user, session: data.session, profile };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user data returned from sign in.');

    const profile = await this.ensureProfile(data.user);
    return { user: data.user, session: data.session, profile };
  },

  async sendPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
  },

  async resendVerificationEmail(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) throw error;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async ensureProfile(user: User): Promise<Profile> {
    try {
      return await this.getProfile(user.id);
    } catch (error: any) {
      if (error?.code && error.code !== 'PGRST116') throw error;
    }

    const fallbackProfile = profileFromUser(user);
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: fallbackProfile.id,
        role: fallbackProfile.role,
        full_name: fallbackProfile.full_name,
      })
      .select()
      .single();

    if (error) return fallbackProfile;
    return data as Profile;
  },

  async updateProfile(userId: string, updates: Partial<Omit<Profile, 'id' | 'role' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },
};
