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

        const tokens = searchParams.get('tokens');
        const error = searchParams.get('error');
        
        if (tokens) {
          try {
            const tokenData = JSON.parse(decodeURIComponent(tokens));
            
            localStorage.setItem('accessToken', tokenData.accessToken);
            localStorage.setItem('refreshToken', tokenData.refreshToken);
            localStorage.setItem('user', JSON.stringify(tokenData.user));
            
            console.log('OAuth authentication successful');
            router.push('/dashboard');
          } catch (parseError) {
            console.error('Failed to parse token data:', parseError);
            router.push('/login?error=token_parse_failed');
          }
        } else if (error) {
          console.error('OAuth error:', error);
          router.push(`/login?error=${error}`);
        } else {
          console.warn('OAuth callback without tokens or error');
          router.push('/login?error=no_tokens');
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