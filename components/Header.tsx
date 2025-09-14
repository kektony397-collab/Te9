
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-indigo-600">
            BikeAdvance PWA
          </h1>
        </div>
      </div>
    </header>
  );
};
