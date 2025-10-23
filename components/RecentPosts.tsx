'use client';

import React, { useState, useEffect } from 'react';
import ProfileCard from '@/components/ProfileCard';

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  author: string | null;
  createdAt: string | null;
}

export default function RecentPosts() {
  const [postsData, setPostsData] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const result = await response.json();
        setPostsData(result);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Recent Posts</h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (postsData.length === 0) {
    return (
      <div className="py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Recent Posts</h2>
        <p className="text-gray-400 text-center">No posts found.</p>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Recent Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
        {postsData.map((post) => (
          <ProfileCard
            key={post.id}
            name={post.title}
            title={post.author || 'Anonymous'}
            handle={post.slug}
            status={post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Draft'}
            avatarUrl="https://via.placeholder.com/150"
            miniAvatarUrl="https://via.placeholder.com/50"
            behindGradient="radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(266,100%,90%,var(--card-opacity)) 4%,hsla(266,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(266,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(266,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00ffaac4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#00c1ffff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#c137ffff 0%,#07c6ffff 40%,#07c6ffff 60%,#c137ffff 100%)"
            innerGradient="linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)"
            onContactClick={() => window.location.href = `/blog/${post.slug}`}
          />
        ))}
      </div>
    </div>
  );
}
