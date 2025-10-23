import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionProvider } from 'next-auth/react';
import SignInPage from '../../app/auth/signin/page';

// Mock next-auth/react
const mockSignIn = vi.fn();
const mockUseSession = vi.fn();

vi.mock('next-auth/react', () => ({
  signIn: mockSignIn,
  useSession: mockUseSession,
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockUseRouter = vi.fn(() => ({
  push: mockPush,
}));

vi.mock('next/navigation', () => ({
  useRouter: mockUseRouter,
}));

// Mock components
vi.mock('@/components/ui/vortex', () => ({
  Vortex: ({ children, ...props }: any) => <div data-testid="vortex" {...props}>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/GradientText', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="gradient-text">{children}</span>
  ),
}));

// Mock localStorage
const localStorageMock = {
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('OAuth Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.setItem.mockClear();
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle complete Google OAuth flow', async () => {
    // Initial unauthenticated state
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const user = userEvent.setup();
    render(
      <SessionProvider>
        <SignInPage />
      </SessionProvider>
    );

    // Verify initial render
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();

    // Click Google sign-in button
    const googleButton = screen.getByText('Sign in with Google');
    await user.click(googleButton);

    // Verify signIn was called with correct parameters
    expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/auth/signin' });

    // Simulate successful authentication with profile
    const mockProfile = {
      id: 1,
      provider: 'google',
      provider_user_id: 'google-user-123',
      email: 'user@example.com',
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
    };

    mockUseSession.mockReturnValue({
      data: { profile: mockProfile },
      status: 'authenticated',
    });

    // Re-render to trigger useEffect
    render(
      <SessionProvider>
        <SignInPage />
      </SessionProvider>
    );

    // Verify redirect and localStorage storage
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'profile',
      JSON.stringify(mockProfile)
    );
  });

  it('should handle complete GitHub OAuth flow', async () => {
    // Initial unauthenticated state
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const user = userEvent.setup();
    render(
      <SessionProvider>
        <SignInPage />
      </SessionProvider>
    );

    // Click GitHub sign-in button
    const githubButton = screen.getByText('Sign in with GitHub');
    await user.click(githubButton);

    // Verify signIn was called with correct parameters
    expect(mockSignIn).toHaveBeenCalledWith('github', { callbackUrl: '/auth/signin' });

    // Simulate successful authentication with profile
    const mockProfile = {
      id: 2,
      provider: 'github',
      provider_user_id: 'github-user-456',
      email: 'github@example.com',
      full_name: 'GitHub User',
      avatar_url: 'https://github.com/avatar.jpg',
    };

    mockUseSession.mockReturnValue({
      data: { profile: mockProfile },
      status: 'authenticated',
    });

    // Re-render to trigger useEffect
    render(
      <SessionProvider>
        <SignInPage />
      </SessionProvider>
    );

    // Verify redirect and localStorage storage
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'profile',
      JSON.stringify(mockProfile)
    );
  });

  it('should handle OAuth sign-in failure', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const user = userEvent.setup();
    render(
      <SessionProvider>
        <SignInPage />
      </SessionProvider>
    );

    // Mock signIn to simulate failure
    mockSignIn.mockResolvedValue({ error: 'OAuthCallback', ok: false });

    // Click Google sign-in button
    const googleButton = screen.getByText('Sign in with Google');
    await user.click(googleButton);

    // Verify signIn was called
    expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/auth/signin' });

    // Should remain on sign-in page
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should prevent multiple redirects during authentication flow', async () => {
    // Start with authenticated state
    const mockProfile = { id: 1, email: 'test@example.com' };
    mockUseSession.mockReturnValue({
      data: { profile: mockProfile },
      status: 'authenticated',
    });

    const { rerender } = render(
      <SessionProvider>
        <SignInPage />
      </SessionProvider>
    );

    // Wait for initial redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    // Simulate session update (which could happen during auth flow)
    mockUseSession.mockReturnValue({
      data: { profile: { ...mockProfile, full_name: 'Updated Name' } },
      status: 'authenticated',
    });

    rerender(
      <SessionProvider>
        <SignInPage />
      </SessionProvider>
    );

    // Should not redirect again
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('should handle loading state during OAuth flow', () => {
    // Simulate loading state during OAuth callback
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(
      <SessionProvider>
        <SignInPage />
      </SessionProvider>
    );

    // Should show sign-in page during loading
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument();

    // Should not redirect during loading
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should store profile data in localStorage correctly', async () => {
    const mockProfile = {
      id: 1,
      provider: 'google',
      provider_user_id: 'google-123',
      email: 'test@example.com',
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      locale: 'en',
      access_token: 'token123',
      refresh_token: 'refresh123',
      token_expires_at: new Date('2024-12-31'),
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
    };

    mockUseSession.mockReturnValue({
      data: { profile: mockProfile },
      status: 'authenticated',
    });

    render(
      <SessionProvider>
        <SignInPage />
      </SessionProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    // Verify localStorage was called with serialized profile
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'profile',
      JSON.stringify(mockProfile)
    );

    // Verify the stored data can be parsed back
    const storedData = localStorageMock.setItem.mock.calls[0][1];
    const parsedData = JSON.parse(storedData);
    expect(parsedData).toEqual(mockProfile);
  });
});
