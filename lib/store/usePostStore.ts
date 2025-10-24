"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Post type from your schema
export interface Post {
  id?: number
  title: string
  slug: string
  content: string
  author?: string | null
  embedding?: string | null
  createdAt?: string | null
}

interface PostState {
  posts: Post[]
  selectedPost: Post | null
  setPosts: (posts: Post[]) => void
  addPost: (post: Post) => void
  selectPost: (post: Post | null) => void
  clearPosts: () => void
}

// Zustand store for posts
export const usePostStore = create<PostState>()(
  persist(
    (set) => ({
      posts: [],
      selectedPost: null,
      setPosts: (posts) => set({ posts }),
      addPost: (post) => set((state) => ({ posts: [...state.posts, post] })),
      selectPost: (post) => set({ selectedPost: post }),
      clearPosts: () => set({ posts: [], selectedPost: null }),
    }),
    {
      name: "post-storage", // saved in localStorage
    }
  )
)
