import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Providers } from '../../components/providers';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children, ...props }: any) => (
    <div data-testid="session-provider" {...props}>
      {children}
    </div>
  ),
}));

describe('Providers', () => {
  it('should render SessionProvider with children', () => {
    const testContent = <div data-testid="test-child">Test Content</div>;

    const { getByTestId } = render(<Providers>{testContent}</Providers>);

    expect(getByTestId('session-provider')).toBeInTheDocument();
    expect(getByTestId('test-child')).toBeInTheDocument();
    expect(getByTestId('test-child')).toHaveTextContent('Test Content');
  });

  it('should render children inside SessionProvider', () => {
    const { container } = render(
      <Providers>
        <span>Child 1</span>
        <div>Child 2</div>
      </Providers>
    );

    const sessionProvider = container.querySelector('[data-testid="session-provider"]');
    expect(sessionProvider).toBeInTheDocument();
    expect(sessionProvider?.children).toHaveLength(2);
  });

  it('should handle complex children structure', () => {
    const complexChildren = (
      <div>
        <h1>Title</h1>
        <p>Paragraph</p>
        <button>Click me</button>
      </div>
    );

    const { getByText } = render(<Providers>{complexChildren}</Providers>);

    expect(getByText('Title')).toBeInTheDocument();
    expect(getByText('Paragraph')).toBeInTheDocument();
    expect(getByText('Click me')).toBeInTheDocument();
  });
});
