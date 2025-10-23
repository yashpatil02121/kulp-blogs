import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import RecentPosts from '../../components/RecentPosts';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('RecentPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading skeleton initially', () => {
    fetchMock.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<RecentPosts />);

    expect(screen.getByText('Recent Posts')).toBeInTheDocument();
    expect(screen.getAllByRole('presentation')).toHaveLength(6); // 6 skeleton items
  });

  it('should render posts when fetch succeeds', async () => {
    const mockPosts = [
      {
        id: 1,
        title: 'Test Post 1',
        slug: 'test-post-1',
        content: 'Content 1',
        author: 'Author 1',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        title: 'Test Post 2',
        slug: 'test-post-2',
        content: 'Content 2',
        author: null,
        createdAt: '2024-01-02T00:00:00Z'
      }
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPosts)
    });

    render(<RecentPosts />);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Author 1')).toBeInTheDocument();
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
    expect(screen.getByText('1/1/2024')).toBeInTheDocument();
  });

  it('should show "No posts found" when API returns empty array', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    });

    render(<RecentPosts />);

    await waitFor(() => {
      expect(screen.getByText('No posts found.')).toBeInTheDocument();
    });
  });

  it('should handle fetch error gracefully', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<RecentPosts />);

    await waitFor(() => {
      expect(screen.getByText('No posts found.')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching posts:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should handle non-ok response', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<RecentPosts />);

    await waitFor(() => {
      expect(screen.getByText('No posts found.')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching posts:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should render correct link for each post', async () => {
    const mockPosts = [
      {
        id: 1,
        title: 'Test Post',
        slug: 'test-post-slug',
        content: 'Content',
        author: 'Author',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPosts)
    });

    render(<RecentPosts />);

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /Test Post/i });
      expect(link).toHaveAttribute('href', '/blog/test-post-slug');
    });
  });
});
