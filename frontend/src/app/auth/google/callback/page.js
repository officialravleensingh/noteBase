'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = () => {
      try {
        if (typeof window === 'undefined') {
          return;
        }

        const auth = searchParams.get('auth');
        const error = searchParams.get('error');
        if (auth === 'success') {
          console.log('OAuth authentication successful');
          router.push('/dashboard');
        } else if (error) {
          console.error('OAuth error:', error);
          router.push(`/login?error=${error}`);
        } else {
          console.warn('OAuth callback without clear status');
          router.push('/login?error=unknown_status');
        }
      } catch (error) {
        console.error('Callback handling error:', error);
        router.push('/login?error=callback_error');
      }
    };
    
    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Google sign-in...</p>
      </div>
    </div>
  );
}