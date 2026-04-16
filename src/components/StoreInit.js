'use client';
import { useEffect } from 'react';
import { initStore } from '../lib/store';

export default function StoreInit() {
  useEffect(() => { initStore(); }, []);
  return null;
}
