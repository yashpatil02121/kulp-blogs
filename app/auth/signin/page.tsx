'use client';

import { signIn } from 'next-auth/react';

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {/* <h1>Sign In</h1> */}
      <button onClick={() => signIn('google')}>Sign in with Google</button>
    </div>
  );
}
