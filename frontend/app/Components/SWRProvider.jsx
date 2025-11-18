"use client";

import { SWRConfig } from 'swr';
import { swrConfig } from '@/app/hooks/useProducts';

export default function SWRProvider({ children }) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
}
