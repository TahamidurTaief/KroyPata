"use client";

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { getUserOrders, createOrderWithPayment } from '@/app/lib/api';

const ProtectedAPITest = () => {
  const { isAuthenticated, user } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTestResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testGetOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getUserOrders();
      
      if (response.error) {
        addTestResult('Get Orders', false, response.error);
      } else {
        addTestResult('Get Orders', true, `Successfully retrieved ${response.length || 0} orders`);
      }
    } catch (error) {
      addTestResult('Get Orders', false, `Error: ${error.message}`);
    }
    setIsLoading(false);
  };

  const testCreateOrder = async () => {
    setIsLoading(true);
    try {
      // Sample order data for testing
      const orderData = {
        items: [
          {
            product_id: 1,
            quantity: 2,
            unit_price: "29.99"
          }
        ],
        shipping_method_id: 1,
        total_amount: "59.98",
        shipping_address: {
          street: "123 Test St",
          city: "Test City",
          state: "Test State",
          zip_code: "12345",
          country: "Test Country"
        },
        payment_info: {
          payment_method: "bkash",
          sender_number: "01712345678",
          transaction_id: "TXN123456789"
        }
      };

      const response = await createOrderWithPayment(orderData);
      
      if (response.error) {
        addTestResult('Create Order', false, response.error);
      } else {
        addTestResult('Create Order', true, `Order created: ${response.order_number || 'Success'}`);
      }
    } catch (error) {
      addTestResult('Create Order', false, `Error: ${error.message}`);
    }
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const simulateExpiredToken = () => {
    // Store a fake expired token to test 401 handling
    localStorage.setItem('accessToken', 'fake.expired.token');
    addTestResult('Token Simulation', true, 'Set fake expired token - next API call should trigger login modal');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🔐 Protected API Test Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Test JWT authentication and 401 redirect handling
        </p>
      </div>

      {/* Authentication Status */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Authentication Status
        </h3>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isAuthenticated 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
          </div>
          {user && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Logged in as: <span className="font-medium">{user.email}</span> ({user.user_type})
            </div>
          )}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          API Tests
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={testGetOrders}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing...
              </>
            ) : 'Test Get Orders'}
          </button>
          
          <button
            onClick={testCreateOrder}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing...
              </>
            ) : 'Test Create Order'}
          </button>
          
          <button
            onClick={simulateExpiredToken}
            disabled={isLoading}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            Simulate Expired Token
          </button>
          
          <button
            onClick={clearResults}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Test Results
        </h3>
        
        {testResults.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No tests run yet. Click a test button above to start.
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  result.success
                    ? 'bg-green-50 border-green-400 dark:bg-green-900/20 dark:border-green-600'
                    : 'bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {result.success ? '✅' : '❌'} {result.test}
                    </div>
                    <div className={`text-sm mt-1 ${
                      result.success
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      {result.message}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {result.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          Test Instructions:
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• <strong>Test Get Orders:</strong> Tests authenticated API call - should work if logged in, show login modal if not</li>
          <li>• <strong>Test Create Order:</strong> Tests protected POST endpoint - requires customer user type</li>
          <li>• <strong>Simulate Expired Token:</strong> Sets fake token to test 401 handling and auto-redirect to login</li>
          <li>• <strong>Expected Behavior:</strong> 401 responses should automatically clear tokens and show login modal</li>
        </ul>
      </div>
    </div>
  );
};

export default ProtectedAPITest;
