'use client';

import React from 'react';
import { Vortex } from '@/components/ui/vortex';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-black">
            {session?.user && (
        <div className="text-end bg-black">
          <p className="text-lg text-gray-300">
            Welcome back, <span className="text-purple-500 font-semibold">{session.user.name}</span>!
          </p>
        </div>
      )}
      <Vortex
        particleCount={100}
        baseHue={220}
        backgroundColor="#000000"
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Welcome to <span className="text-purple-500">Kulp Blogs</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover the latest insights, innovations, and stories from the world of technology,
            design, and creative development.
          </p>
        </div>
      </Vortex>


    </div>
  );
}
