import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string; phone?: string }) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },

  signUp: async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },

  initialize: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch additional profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          // Update user metadata with profile data
          user.user_metadata = {
            ...user.user_metadata,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            phone: profile.phone,
            role: profile.role,
          };
        }
      }

      set({ user, loading: false });
    } catch (error) {
      set({ user: null, loading: false });
      console.error('Error initializing auth:', error);
    }
  },

  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) throw new Error('No user logged in');

    try {
      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local user state
      set({
        user: {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            ...updates,
          },
        },
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
  },
}));