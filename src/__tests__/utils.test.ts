import { describe, it, expect } from 'vitest';
import { cn } from '../../lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('bg-red-500', 'text-white', 'p-4');
    expect(result).toBe('bg-red-500 text-white p-4');
  });

  it('should handle clsx inputs', () => {
    const result = cn('bg-red-500', false && 'hidden', 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class', 'always-class');
    expect(result).toBe('base-class active-class always-class');
  });

  it('should merge conflicting Tailwind classes', () => {
    const result = cn('bg-red-500', 'bg-blue-500');
    expect(result).toBe('bg-blue-500');
  });

  it('should handle undefined and null values', () => {
    const result = cn('bg-red-500', undefined, null, 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });

  it('should handle empty strings and arrays', () => {
    const result = cn('bg-red-500', [], '', 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });

  it('should handle object syntax', () => {
    const result = cn('base', { 'active': true, 'disabled': false });
    expect(result).toBe('base active');
  });

  it('should return empty string for no inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });
});
