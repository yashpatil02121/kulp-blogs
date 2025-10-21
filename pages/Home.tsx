'use client';

import React, { useState, useEffect } from 'react';
import { Vortex } from '@/components/ui/vortex';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Profile } from '@/lib/types';
import RecentPosts from '@/components/RecentPosts';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [storedSession, setStoredSession] = useState<any>(null);

  useEffect(() => {
    // Get stored session and profile data from localStorage on component mount
    const storedSessionData = localStorage.getItem('session');
    const storedProfileData = localStorage.getItem('profile');

    if (storedSessionData) {
      try {
        const parsedSession = JSON.parse(storedSessionData);
        setStoredSession(parsedSession);
      } catch (error) {
        console.error('Error parsing session from localStorage:', error);
      }
    }

    if (storedProfileData) {
      try {
        const parsedProfile = JSON.parse(storedProfileData);
        setProfile(parsedProfile);
      } catch (error) {
        console.error('Error parsing profile from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Update with live session data if available and save complete profile
    if (session?.user && session?.profile) {
      // Update localStorage with complete profile data
      const profileObject = JSON.stringify(session.profile);
      localStorage.setItem('profile', profileObject);

      // Update session in localStorage
      const sessionData = JSON.stringify(session);
      localStorage.setItem('session', sessionData);

      setProfile(session.profile);
      setStoredSession(session);
      console.log('Complete profile data updated in localStorage');
    }
  }, [session, profile]);

  useEffect(() => {
    // Check if profile exists in localStorage, if not navigate to signin
    const storedProfileData = localStorage.getItem('profile');
    if (!storedProfileData) {
      router.push('/auth/signin');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black">
            {(session?.user || storedSession?.user) && profile && (
        <div className="text-end bg-black">
          <p className="text-lg text-gray-300">
            Welcome back, <span className="text-purple-500 font-semibold">{profile.full_name}</span>!
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
      <RecentPosts />
    </div>
  );
}
