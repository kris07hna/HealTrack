import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/database';
import { useNotifications } from '@/lib/notifications';

export default function AuthCallback() {
  const router = useRouter();
  const { addNotification } = useNotifications();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Handling auth callback...');
        
        // Get the session from URL hash or search params
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          addNotification({
            type: 'error',
            title: 'Authentication Error',
            message: 'There was an error confirming your email. Please try again.',
          });
          router.push('/');
          return;
        }

        if (data.session) {
          console.log('Auth callback successful, user authenticated:', data.session.user.email);
          
          // Show success notification
          addNotification({
            type: 'success',
            title: 'Email Confirmed! 🎉',
            message: 'Your account has been activated. Welcome to HealTrack!',
          });
          
          // Create user profile if it doesn't exist
          const user = data.session.user;
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            if (!profile) {
              console.log('Creating user profile...');
              await supabase.from('profiles').insert({
                id: user.id,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          }
          
          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          console.log('No session in auth callback, redirecting to home');
          addNotification({
            type: 'info',
            title: 'Please Sign In',
            message: 'Please sign in to access your account.',
          });
          router.push('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        addNotification({
          type: 'error',
          title: 'Authentication Error',
          message: 'There was an error processing your request. Please try again.',
        });
        router.push('/');
      }
    };

    handleAuthCallback();
  }, [router, addNotification]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Confirming your email...</h2>
        <p className="text-white/70">Please wait while we activate your account.</p>
      </div>
    </div>
  );
}
