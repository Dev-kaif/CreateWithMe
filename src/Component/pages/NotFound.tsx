
import { useRouter } from 'next/navigation';
import React from 'react';

const NotFound = () => {
  const navigate = useRouter();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#121212] text-white p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-400 mb-8">The page you are looking for doesn&apos;t exist or has been moved.</p>
      <button
        onClick={() => navigate.push('/')}
        className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
      >
        Go back home
      </button>
    </div>
  );
};

export default NotFound;
