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
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; needsConfirmation?: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; needsConfirmation?: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
  resendConfirmation: (email: string) => Promise<{ success: boolean; error?: string }>;
  loadUserProfile: () => Promise<void>;
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
    let loadingTimeoutId: NodeJS.Timeout | null = null;

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
          
          // Try to load profile data to get the full name
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profile && !profileError) {
              authUser.name = profile.full_name || authUser.name;
              console.log('Profile data loaded during session check:', profile);
            }
          } catch (error) {
            console.error('Error loading profile during session check:', error);
          }

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

    // Force loading to false after 3 seconds as a fallback (reduced from 5 seconds)
    loadingTimeoutId = setTimeout(() => {
      if (mounted) {
        console.log('Loading timeout reached, forcing isLoading to false');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }, 3000);

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email, 'Email confirmed:', !!session?.user?.email_confirmed_at);
      
      if (!mounted) return;
      
      // Handle different auth events
      if (event === 'SIGNED_OUT') {
        console.log('User signed out - clearing state');
        setState({
          isAuthenticated: false,
          user: null,
          supabaseUser: null,
          token: null,
          isLoading: false,
        });
        return;
      }
      
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
          avatar: session.user.user_metadata?.avatar_url
        };

        console.log('Setting authenticated user from auth state change:', authUser);
        
        // Create/check profile for authenticated user
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

        // Load profile data after setting the initial user state
        if (event === 'SIGNED_IN') {
          // Use setTimeout to ensure state is updated first
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (profile && !error) {
                const updatedUser: AuthUser = {
                  ...authUser,
                  name: profile.full_name || authUser.name,
                };
                
                setState(prev => ({
                  ...prev,
                  user: updatedUser
                }));
                console.log('Profile data loaded and user updated:', updatedUser);
              }
            } catch (error) {
              console.error('Error loading profile on sign in:', error);
            }
          }, 100);
        }
      } else {
        console.log('No session - clearing user state');
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          supabaseUser: null,
          token: null,
          isLoading: false,
        }));
      }
    });

    return () => {
      mounted = false;
      if (loadingTimeoutId) {
        clearTimeout(loadingTimeoutId);
      }
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; needsConfirmation?: boolean; error?: string }> => {
    console.log('Login attempt started for:', credentials.email);
    
    // Reset any previous error states and set loading
    setState(prev => ({ 
      ...prev, 
      isLoading: true,
      // Clear any existing state to prevent conflicts
      isAuthenticated: false,
      user: null,
      supabaseUser: null,
      token: null
    }));
    
    try {
      console.log('Attempting login with:', credentials.email);
      
      // Clear any existing session first to prevent conflicts
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        console.error('Login error:', error.message);
        setState(prev => ({ ...prev, isLoading: false }));
        
        // Check if it's an email not confirmed error
        if (error.message.includes('Email not confirmed') || 
            error.message.includes('email_not_confirmed') ||
            error.message.includes('Email link is invalid or has expired')) {
          return { 
            success: false, 
            needsConfirmation: true,
            error: 'Please check your email and click the confirmation link before signing in.'
          };
        }
        
        return { 
          success: false,
          error: error.message || 'Invalid email or password. Please try again.'
        };
      }
      
      console.log('Login successful:', data.user?.email);
      console.log('Auth state after login:', data);
      
      // Don't set loading to false here - let the auth state change handler do it
      // Just return success and let the onAuthStateChange handle the rest
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred.'
      };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; needsConfirmation?: boolean; error?: string }> => {
    console.log('Registration attempt started for:', data.email);
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      if (data.password !== data.confirmPassword) {
        console.error('Passwords do not match');
        setState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: 'Passwords do not match' };
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
        return { success: false, error: error.message };
      }
      
      console.log('Registration response:', authData);

      // Always set loading to false after registration attempt
      setState(prev => ({ ...prev, isLoading: false }));

      // Check if the user needs email confirmation
      if (authData.user && !authData.session) {
        // Email confirmation required
        console.log('User registered, email confirmation required');
        return { success: true, needsConfirmation: true };
      } else if (authData.user && authData.session) {
        // User is immediately signed in (email confirmation disabled)
        console.log('User registered and signed in immediately');
        return { success: true, needsConfirmation: false };
      }
      
      return { success: true, needsConfirmation: true };
    } catch (error) {
      console.error('Registration error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed. Please try again.'
      };
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
      
      // Set loading state
      setState(prev => ({ ...prev, isLoading: true }));
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      } else {
        console.log('Logout successful');
      }
      
      // Force clear the state immediately
      setState({
        isAuthenticated: false,
        user: null,
        supabaseUser: null,
        token: null,
        isLoading: false,
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the state even if there's an error
      setState({
        isAuthenticated: false,
        user: null,
        supabaseUser: null,
        token: null,
        isLoading: false,
      });
    }
  };

  const updateUser = (updatedUser: Partial<AuthUser>) => {
    if (state.user) {
      const newUser = { ...state.user, ...updatedUser };
      setState(prev => ({ ...prev, user: newUser }));
    }
  };

  const resendConfirmation = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Resending confirmation email for:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('Resend confirmation error:', error.message);
        return { success: false, error: error.message };
      }
      
      console.log('Confirmation email resent successfully');
      return { success: true };
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to resend confirmation email.'
      };
    }
  };

  const loadUserProfile = async (): Promise<void> => {
    if (!state.user?.id) return;
    
    try {
      console.log('Loading user profile for:', state.user.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', state.user.id)
        .single();
      
      if (error) {
        console.error('Error loading profile:', error);
        return;
      }
      
      if (profile) {
        console.log('Profile loaded:', profile);
        // Update the user context with profile data
        const updatedUser: AuthUser = {
          ...state.user,
          name: profile.full_name || state.user.name,
          // You can add more fields here as needed
        };
        
        setState(prev => ({
          ...prev,
          user: updatedUser
        }));
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    resendConfirmation,
    loadUserProfile,
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
