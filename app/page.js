// app/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton } from '@clerk/nextjs';

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    // as soon as we know the user is signed in, redirect to /workspace
    if (isLoaded && isSignedIn) {
      router.replace('/workspace');
    }
  }, [isLoaded, isSignedIn, router]);

  // While Clerk state is loading, or if not signed in, show a fallback
  if (!isLoaded) {
    return <div>Loading…</div>;
  }
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="mb-4 text-xl">Welcome—please sign in</h2>
        <SignInButton />
      </div>
    );
  }
  // (rare) signed-in users will have already been redirected
  return null;
}
