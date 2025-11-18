"use client";

import React from 'react';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Panel</h1>
        <p className="text-gray-600">Admin functionality is currently disabled.</p>
        <Link
          href="/"
          className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
