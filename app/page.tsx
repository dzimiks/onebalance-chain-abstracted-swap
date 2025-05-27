'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to swap page by default
    router.replace('/swap');
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen justify-center items-center font-[family-name:var(--font-geist-sans)] bg-background transition-colors">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="mt-4 text-muted-foreground">Redirecting...</p>
    </div>
  );
}
