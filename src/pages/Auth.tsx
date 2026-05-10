import React from 'react';
import { AuthForm } from '../components/AuthForm';

export default function Auth() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Welcome</h2>
          <p className="text-gray-500">Log in or create an account to start printing.</p>
        </div>
        <div className="h-[600px]">
          <AuthForm theme="light" />
        </div>
      </div>
    </div>
  );
}
