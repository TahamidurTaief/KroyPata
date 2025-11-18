'use client';

import { useEffect } from 'react';
import { useChunkLoadErrorHandler, preloadCriticalChunks } from '../hooks/useChunkLoadErrorHandler';

export function ChunkErrorHandler() {
  useChunkLoadErrorHandler();

  useEffect(() => {
    // Preload critical chunks on mount
    preloadCriticalChunks();
  }, []);

  return null; // This component doesn't render anything
}

export default ChunkErrorHandler;
