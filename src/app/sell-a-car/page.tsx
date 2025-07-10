"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SellYourCarPage() {
  const router = useRouter();
  const googleFormURL = 'https://forms.gle/ttebyUczkCa7KebYA';

  useEffect(() => {
    // Replace current page in history instead of adding new entry
    router.replace(googleFormURL);
  }, [router, googleFormURL]);

  return (
    <p>Redirecting you to our car selling form...</p>
  );
}