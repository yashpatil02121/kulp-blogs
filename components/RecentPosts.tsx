'use client';

import React, { useState, useEffect } from 'react';

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postsData.map((post) => (
          <div key={post.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
            <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2">
              {post.title}
            </h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
              {post.content.substring(0, 150)}...
            </p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              {post.author && <span>By {post.author}</span>}
              {post.createdAt && (
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
