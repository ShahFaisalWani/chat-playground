'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex justify-center items-center h-full">
      <div className="p-8 rounded-lg bg-bg shadow-sm shadow-text-gray w-full max-w-lg max-md:mx-4">
        <h1 className="text-md md:text-xl lg:text-2xl font-semibold mb-6 text-center">Welcome to Chat Playground</h1>

        <div className="max-w-sm md:m-auto">
          {children}
        </div>

        <div className="mt-4 text-center max-w-sm m-auto">
          <div>
            {pathname === '/login' ? (
              <div className="flex gap-2 justify-center">
                <span className="text-sm">Don't have an account?</span>
                <Link href="/register" className="text-primary hover:underline">
                  Register here
                </Link>
              </div>
            ) : (
              <div className="flex gap-2 justify-center">
                <span className="text-sm">Already have an account?</span>
                <Link href="/login" className="text-primary hover:underline">
                  Login here
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

