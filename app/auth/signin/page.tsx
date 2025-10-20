'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      // Redirect to home page after successful authentication
      router.push('/');
    }
  }, [status, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {/* <h1>Sign In</h1> */}
      <button onClick={() => signIn('google')}>Sign in with Google</button>
    </div>
  );
}
