import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './database';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  supabaseUser: SupabaseUser | null;
  token: string | null;
  isLoading: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; needsConfirmation?: boolean }>;
  register: (data: RegisterData) => Promise<{ success: boolean; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    supabaseUser: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    let mounted = true;

    // Check for existing session on mount
    const checkSession = async () => {
      try {
        console.log('Starting session check...');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Session check result:', { session: !!session, error, email: session?.user?.email });
        
        if (!mounted) return;

        if (session?.user && !error) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
            avatar: session.user.user_metadata?.avatar_url
          };

          console.log('Setting authenticated user:', authUser);
          setState({
            isAuthenticated: true,
            user: authUser,
            supabaseUser: session.user,
            token: session.access_token,
            isLoading: false,
          });
        } else {
          console.log('No session found, setting loading to false');
          setState({
            isAuthenticated: false,
            user: null,
            supabaseUser: null,
            token: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (mounted) {
          setState({
            isAuthenticated: false,
            user: null,
            supabaseUser: null,
            token: null,
            isLoading: false,
          });
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (!mounted) return;
      
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
          avatar: session.user.user_metadata?.avatar_url
        };

        console.log('Setting user from auth state change:', authUser);
        
        // If this is a sign-in event or first time user, create/check profile
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('Creating/checking profile for authenticated user');
          await createUserProfile(session.user);
        }

        setState({
          isAuthenticated: true,
          user: authUser,
          supabaseUser: session.user,
          token: session.access_token,
          isLoading: false,
        });
      } else {
        console.log('Clearing user from auth state change');
        setState({
          isAuthenticated: false,
          user: null,
          supabaseUser: null,
          token: null,
          isLoading: false,
        });
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; needsConfirmation?: boolean }> => {
    console.log('Login attempt started for:', credentials.email);
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('Attempting login with:', credentials.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        console.error('Login error:', error.message);
        setState(prev => ({ ...prev, isLoading: false }));
        
        // Check if it's an email not confirmed error
        if (error.message.includes('Email not confirmed') || error.message.includes('signup_disabled')) {
          return { success: false, needsConfirmation: true };
        }
        
        return { success: false };
      }
      
      console.log('Login successful:', data.user?.email);
      console.log('Auth state after login:', data);
      // The onAuthStateChange will handle setting the state
      // Don't set isLoading to false here, let the auth state change handle it
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; needsConfirmation?: boolean }> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      if (data.password !== data.confirmPassword) {
        console.error('Passwords do not match');
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false };
      }

      console.log('Attempting registration with:', data.email);
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });
      
      if (error) {
        console.error('Registration error:', error.message);
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false };
      }
      
      console.log('Registration successful:', authData.user?.email);
      console.log('Registration data:', authData);

      // Check if user needs email confirmation
      if (authData.user && !authData.session) {
        console.log('User needs email confirmation');
        // User created but needs email confirmation
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: true, needsConfirmation: true };
      }

      // If user is immediately authenticated (email confirmation disabled)
      if (authData.user && authData.session) {
        console.log('User immediately authenticated, creating profile...');
        await createUserProfile(authData.user);
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: true, needsConfirmation: false };
    } catch (error) {
      console.error('Registration error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false };
    }
  };

  // Helper function to create user profile
  const createUserProfile = async (user: any) => {
    try {
      console.log('Creating/checking profile for user:', user.id);
      
      // First check if profile already exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', fetchError);
        return;
      }

      if (existingProfile) {
        console.log('Profile already exists for user:', user.id);
        return;
      }

      // Create new profile
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ]);

      if (error) {
        console.error('Error creating profile:', error);
      } else {
        console.log('Profile created successfully for:', user.id);
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('Attempting logout');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      } else {
        console.log('Logout successful');
      }
      // The onAuthStateChange will handle clearing the state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (updatedUser: Partial<AuthUser>) => {
    if (state.user) {
      const newUser = { ...state.user, ...updatedUser };
      setState(prev => ({ ...prev, user: newUser }));
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
