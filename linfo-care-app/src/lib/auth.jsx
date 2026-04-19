import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

const AuthContext = createContext(null);

// Guest profile for non-logged-in family visitors
const GUEST_PROFILE = {
  id: 'guest',
  display_name: 'Familia',
  role: 'guest',
  email: null,
};

// Admin emails — users with these emails get admin role
const ADMIN_EMAILS = ['dan.kardona@gmail.com'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Supabase user (null for guests)
  const [profile, setProfile] = useState(null);  // Profile from DB or guest profile
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Supabase not configured — demo mode with admin access
      setUser({ id: 'demo-user', email: 'demo@linfocare.app' });
      setProfile({ id: 'demo-user', display_name: 'Demo Admin', role: 'admin', email: 'demo@linfocare.app' });
      setIsDemo(true);
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email);
      } else {
        // No session → guest mode (family can see everything)
        setUser(null);
        setProfile(GUEST_PROFILE);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setProfile(GUEST_PROFILE);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId, email) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      // Override role to admin if email matches
      const role = ADMIN_EMAILS.includes(email?.toLowerCase()) ? 'admin' : data.role;
      setProfile({ ...data, role });
    } else if (error?.code === 'PGRST116') {
      // Profile doesn't exist yet — create it
      const currentUser = (await supabase.auth.getUser()).data.user;
      const role = ADMIN_EMAILS.includes(email?.toLowerCase()) ? 'admin' : 'member';
      const newProfile = {
        id: userId,
        email: currentUser?.email,
        display_name: currentUser?.user_metadata?.display_name || currentUser?.email?.split('@')[0] || 'Familia',
        role,
      };
      const { data: created } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();
      setProfile(created || newProfile);
    }
  }

  async function signInWithMagicLink(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error };
  }

  async function signOut() {
    if (isDemo) {
      setUser(null);
      setProfile(GUEST_PROFILE);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(GUEST_PROFILE);
  }

  const isAdmin = profile?.role === 'admin';
  const isGuest = !user || user.id === 'guest';
  const isMember = !!user && profile?.role === 'member';

  const value = {
    user,
    profile,
    loading,
    isDemo,
    isAdmin,
    isGuest,
    isMember,
    signInWithMagicLink,
    signOut,
    displayName: profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Familia',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
