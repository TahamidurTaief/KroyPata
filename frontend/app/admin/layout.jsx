"use client";

import React from 'react';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
