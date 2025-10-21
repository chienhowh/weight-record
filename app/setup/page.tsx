'use client';

import { useRouter } from 'next/navigation';
import InitialSetup from '../components/InitialSetup';

export default function SetupPage() {
  const router = useRouter();

  return (
    <InitialSetup 
      onComplete={() => router.push('/dashboard')} 
    />
  );
}