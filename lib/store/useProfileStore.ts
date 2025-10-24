"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Profile {
  id?: number
  provider: string
  provider_user_id: string
  email?: string | null
  full_name?: string | null
  avatar_url?: string | null
  locale?: string | null
  access_token?: string | null
  refresh_token?: string | null
  token_expires_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

interface ProfileState {
  profile: Profile | null
  setProfile: (profile: Profile) => void
  clearProfile: () => void
}

// Zustand store for logged-in user
export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: "profile-storage",
    }
  )
)
