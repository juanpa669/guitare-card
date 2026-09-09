'use client';

import { useSearchParams } from 'next/navigation';

export function useInstrumentId(): string {
  const params = useSearchParams();
  return params.get('id') ?? '';
}
