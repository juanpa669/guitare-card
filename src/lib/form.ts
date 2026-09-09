import type { KeyboardEvent } from 'react';

export function shouldBlockEnterKey(tagName: string | null | undefined, key: string): boolean {
  return key === 'Enter' && tagName === 'INPUT';
}

export function handleFormKeyDown(e: KeyboardEvent<HTMLElement>): void {
  const tagName = (e.target as HTMLElement | null)?.tagName;
  if (shouldBlockEnterKey(tagName, e.key)) {
    e.preventDefault();
  }
}
