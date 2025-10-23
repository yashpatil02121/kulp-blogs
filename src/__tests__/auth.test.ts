import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authOptions } from '../../app/api/auth/[...nextauth]/route';

// Mock the database
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();
const mockSet = vi.fn();
const mockValues = vi.fn();

const mockDb = {
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
};

vi.mock('@/lib/db', () => ({
  db: mockDb,
}));

vi.mock('@/lib/schema', () => ({
  profiles: {
    provider_user_id: 'provider_user_id',
    provider: 'provider',
    email: 'email',
    full_name: 'full_name',
    avatar_url: 'avatar_url',
    locale: 'locale',
    access_token: 'access_token',
    refresh_token: 'refresh_token',
    token_expires_at: 'token_expires_at',
    updated_at: 'updated_at',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value })),
}));

// Mock process.env
const originalEnv = process.env;
beforeEach(() => {
  process.env = {
    ...originalEnv,
    NEXTAUTH_SECRET: 'test-secret',
    GOOGLE_CLIENT_ID: 'google-client-id',
    GOOGLE_CLIENT_SECRET: 'google-client-secret',
    GITHUB_CLIENT_ID: 'github-client-id',
    GITHUB_CLIENT_SECRET: 'github-client-secret',
  };
});

afterEach(() => {
  process.env = originalEnv;
  vi.clearAllMocks();
});

describe('NextAuth Configuration', () => {
  describe('authOptions', () => {
    it('should have correct providers configuration', () => {
      expect(authOptions.providers).toHaveLength(2);

      // Check Google provider
      const googleProvider = authOptions.providers[0];
      expect(googleProvider.id).toBe('google');

      // Check GitHub provider
      const githubProvider = authOptions.providers[1];
      expect(githubProvider.id).toBe('github');
    });

    it('should have correct pages configuration', () => {
      expect(authOptions.pages?.signIn).toBe('/auth/signin');
    });
  });

  describe('signIn callback', () => {
    const mockSignInCallback = authOptions.callbacks?.signIn as Function;

    beforeEach(() => {
      // Setup database mocks
      mockSelect.mockReturnValue({
        from: mockFrom.mockReturnThis(),
        where: mockWhere.mockReturnThis(),
        limit: mockLimit.mockReturnValue([]),
      });

      mockInsert.mockReturnValue({
        values: mockValues.mockResolvedValue(undefined),
      });

      mockUpdate.mockReturnValue({
        set: mockSet.mockReturnThis(),
        where: mockWhere.mockResolvedValue(undefined),
      });
    });

    it('should handle Google sign-in for new user', async () => {
      const googleUser = {
        id: 'google-user-id',
        name: 'John Doe',
        email: 'john@example.com',
        image: 'https://example.com/avatar.jpg',
      };

      const account = {
        provider: 'google',
        access_token: 'google-access-token',
        refresh_token: 'google-refresh-token',
        expires_at: 1234567890,
      };

      const profile = {
        sub: 'google-user-id',
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'https://example.com/avatar.jpg',
        locale: 'en',
      };

      const result = await mockSignInCallback({
        user: googleUser,
        account,
        profile,
      });

      expect(result).toBe(true);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalledWith(expect.any(Object));
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.objectContaining({
            provider: 'google',
            provider_user_id: 'google-user-id',
            email: 'john@example.com',
            full_name: 'John Doe',
            avatar_url: 'https://example.com/avatar.jpg',
            locale: 'en',
            access_token: 'google-access-token',
            refresh_token: 'google-refresh-token',
          }),
        })
      );
    });

    it('should handle GitHub sign-in for new user', async () => {
      const githubUser = {
        id: 'github-user-id',
        name: 'Jane Smith',
        email: 'jane@example.com',
        image: 'https://github.com/avatar.jpg',
      };

      const account = {
        provider: 'github',
        access_token: 'github-access-token',
        refresh_token: 'github-refresh-token',
        expires_at: 1234567890,
      };

      const profile = {
        id: 'github-user-id',
        login: 'janesmith',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar_url: 'https://github.com/avatar.jpg',
      };

      const result = await mockSignInCallback({
        user: githubUser,
        account,
        profile,
      });

      expect(result).toBe(true);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.objectContaining({
            provider: 'github',
            provider_user_id: 'github-user-id',
            email: 'jane@example.com',
            full_name: 'Jane Smith',
            avatar_url: 'https://github.com/avatar.jpg',
          }),
        })
      );
    });

    it('should update existing user profile', async () => {
      // Mock existing user
      mockLimit.mockReturnValue([{ id: 1, provider_user_id: 'existing-user-id' }]);

      const googleUser = {
        id: 'existing-user-id',
        name: 'Updated Name',
        email: 'updated@example.com',
        image: 'https://example.com/updated-avatar.jpg',
      };

      const account = {
        provider: 'google',
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_at: 1234567890,
      };

      const profile = {
        sub: 'existing-user-id',
        name: 'Updated Name',
        email: 'updated@example.com',
        picture: 'https://example.com/updated-avatar.jpg',
        locale: 'en',
      };

      const result = await mockSignInCallback({
        user: googleUser,
        account,
        profile,
      });

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          email: 'updated@example.com',
          full_name: 'Updated Name',
          avatar_url: 'https://example.com/updated-avatar.jpg',
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
        })
      );
    });

    it('should return false when provider user ID is missing', async () => {
      const result = await mockSignInCallback({
        user: { name: 'Test User' },
        account: { provider: 'google' },
        profile: {}, // No sub or id
      });

      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      mockSelect.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await mockSignInCallback({
        user: {
          id: 'test-user',
          name: 'Test User',
          email: 'test@example.com',
        },
        account: { provider: 'google' },
        profile: { sub: 'test-user-id' },
      });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error during sign-in:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('jwt callback', () => {
    const mockJwtCallback = authOptions.callbacks?.jwt as Function;

    beforeEach(() => {
      mockSelect.mockReturnValue({
        from: mockFrom.mockReturnThis(),
        where: mockWhere.mockReturnThis(),
        limit: mockLimit.mockReturnValue([]),
      });
    });

    it('should return token unchanged when no sub', async () => {
      const token = { name: 'Test User' };
      const result = await mockJwtCallback({ token });

      expect(result).toEqual(token);
    });

    it('should attach profile data to token when user exists', async () => {
      const mockProfile = { id: 1, email: 'test@example.com' };
      mockLimit.mockReturnValue([mockProfile]);

      const token = { sub: 'test-user-id', name: 'Test User' };
      const result = await mockJwtCallback({ token });

      expect(result).toEqual({
        ...token,
        profile: mockProfile,
      });
    });

    it('should handle database errors in jwt callback', async () => {
      mockSelect.mockImplementation(() => {
        throw new Error('Database error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const token = { sub: 'test-user-id', name: 'Test User' };
      const result = await mockJwtCallback({ token });

      expect(result).toEqual(token);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching profile in jwt callback:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('session callback', () => {
    const mockSessionCallback = authOptions.callbacks?.session as Function;

    it('should attach user id to session', async () => {
      const session = {
        user: { name: 'Test User', email: 'test@example.com' },
      };
      const token = { sub: 'test-user-id', profile: { id: 1, email: 'test@example.com' } };

      const result = await mockSessionCallback({ session, token });

      expect(result.user.id).toBe('test-user-id');
      expect(result.profile).toEqual(token.profile);
    });

    it('should handle session without profile', async () => {
      const session = {
        user: { name: 'Test User', email: 'test@example.com' },
      };
      const token = { sub: 'test-user-id' };

      const result = await mockSessionCallback({ session, token });

      expect(result.user.id).toBe('test-user-id');
      expect(result.profile).toBeUndefined();
    });
  });
});
