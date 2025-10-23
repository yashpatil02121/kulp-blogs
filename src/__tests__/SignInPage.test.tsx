import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignInPage from '../../app/auth/signin/page';

// Mock next-auth/react
const mockSignIn = vi.fn();
const mockUseSession = vi.fn();

vi.mock('next-auth/react', () => ({
  signIn: mockSignIn,
  useSession: mockUseSession,
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

describe('SignInPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.setItem.mockClear();
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the sign-in page correctly', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<SignInPage />);

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue your journey with us')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument();
  });

  it('should render Google sign-in button with correct text', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<SignInPage />);

    const googleButton = screen.getByText('Sign in with Google');
    expect(googleButton).toBeInTheDocument();
    expect(googleButton.closest('button')).toBeInTheDocument();
  });

  it('should render GitHub sign-in button with correct text', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<SignInPage />);

    const githubButton = screen.getByText('Sign in with GitHub');
    expect(githubButton).toBeInTheDocument();
    expect(githubButton.closest('button')).toBeInTheDocument();
  });

  it('should call signIn with Google when Google button is clicked', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const user = userEvent.setup();
    render(<SignInPage />);

    const googleButton = screen.getByText('Sign in with Google');
    await user.click(googleButton);

    expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/auth/signin' });
    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });

  it('should call signIn with GitHub when GitHub button is clicked', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const user = userEvent.setup();
    render(<SignInPage />);

    const githubButton = screen.getByText('Sign in with GitHub');
    await user.click(githubButton);

    expect(mockSignIn).toHaveBeenCalledWith('github', { callbackUrl: '/auth/signin' });
    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });

  it('should redirect to home page when user is authenticated with profile', async () => {
    const mockProfile = { id: 1, email: 'test@example.com' };

    mockUseSession.mockReturnValue({
      data: { profile: mockProfile },
      status: 'authenticated',
    });

    render(<SignInPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'profile',
      JSON.stringify(mockProfile)
    );
  });

  it('should not redirect if already navigated', async () => {
    const mockProfile = { id: 1, email: 'test@example.com' };

    mockUseSession.mockReturnValue({
      data: { profile: mockProfile },
      status: 'authenticated',
    });

    const { rerender } = render(<SignInPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    // Simulate session change
    mockUseSession.mockReturnValue({
      data: { profile: { id: 2, email: 'test2@example.com' } },
      status: 'authenticated',
    });

    rerender(<SignInPage />);

    // Should not call push again due to hasNavigated state
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('should not redirect when user is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(<SignInPage />);

    expect(mockPush).not.toHaveBeenCalled();
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('should not redirect when user is unauthenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<SignInPage />);

    expect(mockPush).not.toHaveBeenCalled();
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('should render Vortex component with correct props', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<SignInPage />);

    const vortex = screen.getByTestId('vortex');
    expect(vortex).toHaveClass('flex flex-col items-center justify-center min-h-screen');
    expect(vortex).toHaveAttribute('backgroundColor', '#000000');
    expect(vortex).toHaveAttribute('baseHue', '220');
    expect(vortex).toHaveAttribute('particleCount', '20');
  });

  it('should render gradient text components', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<SignInPage />);

    const gradientTexts = screen.getAllByTestId('gradient-text');
    expect(gradientTexts).toHaveLength(2);
    expect(gradientTexts[0]).toHaveTextContent('Sign in with Google');
    expect(gradientTexts[1]).toHaveTextContent('Sign in with GitHub');
  });
});
