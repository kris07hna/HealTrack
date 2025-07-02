import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/database';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Handling auth callback...');
        
        // Get the session from URL hash or search params
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/?error=auth_callback_error');
          return;
        }

        if (data.session) {
          console.log('Auth callback successful, user authenticated:', data.session.user.email);
          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          console.log('No session in auth callback, redirecting to home');
          router.push('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/?error=auth_callback_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Confirming your account...
            </h2>
            <p className="text-sm text-gray-600">
              Please wait while we complete your registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
