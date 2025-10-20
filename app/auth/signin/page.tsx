'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="flex flex-col items-center justify-center h-screen">
      <button onClick={() => signIn('google', { callbackUrl: '/auth/signin' })}>Sign in with Google</button>
    </div>
  );
}
