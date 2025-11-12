"use client";
import DailyRecord from '@/app/components/DailyRecord';
import { Suspense } from 'react';

export default function RecordPage() {
  return <Suspense fallback={null}><DailyRecord /></Suspense>;
}