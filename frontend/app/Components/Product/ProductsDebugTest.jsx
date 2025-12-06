"use client";

import React, { useState, useEffect } from 'react';

const ProductsDebugTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      console.log('🧪 Starting API test...');
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.chinakroy.com';
      const response = await fetch(`${apiBaseUrl}/api/products/`);
      
      console.log('Response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      setTestResult({
        success: true,
        count: data.count,
        resultsLength: data.results?.length,
        firstProduct: data.results?.[0]
      });
    } catch (error) {
      console.error('API Error:', error);
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-[var(--card)] border-[var(--border)]">
      <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Products API Debug Test</h3>
      
      <button 
        onClick={testAPI} 
        disabled={loading}
        className="px-4 py-2 bg-[var(--primary)] text-white rounded hover:bg-[var(--primary)]/90 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>
      
      {testResult && (
        <div className="mt-4 p-3 rounded bg-[var(--muted)]">
          <pre className="text-[var(--foreground)]">{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ProductsDebugTest;
