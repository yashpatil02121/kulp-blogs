'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vortex } from '@/components/ui/vortex';
import { Button } from '@/components/ui/button';
import GradientText from '@/components/GradientText';

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.profile && !hasNavigated) {
      localStorage.setItem('profile', JSON.stringify(session.profile));
      setHasNavigated(true);
      router.push('/');
    }
  }, [status, session, router, hasNavigated]);

  return (
    <Vortex
      className="flex flex-col items-center justify-center min-h-screen"
      backgroundColor="#000000"
      baseHue={220}
      particleCount={20}
    >
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Welcome Back
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-md">
            Sign in to continue your journey with us
          </p>
          <Button
            onClick={() => signIn('google', { callbackUrl: '/auth/signin' })}
            className="bg-transparent border border-white text-white  px-8 py-3 text-lg font-medium rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          >
            <GradientText>
            Sign in with Google
            </GradientText>
          </Button>
          <Button
            onClick={() => signIn('github', { callbackUrl: '/auth/signin' })}
            className="bg-transparent border border-white text-white  px-8 py-3 text-lg font-medium rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          >
            <GradientText>
            Sign in with GitHub
            </GradientText>
          </Button>
        </div>
      </div>
    </Vortex>
  );
}
