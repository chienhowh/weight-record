"use client";
import DailyRecord from '../components/DailyRecord';
import { Suspense } from 'react';

export default function RecordPage() {
  return <Suspense fallback={null}><DailyRecord /></Suspense>;
}