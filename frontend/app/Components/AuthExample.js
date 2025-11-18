// app/Components/AuthExample.js
'use client';

import { useState } from 'react';
import { authenticateUser, registerUser, isAuthenticated, logoutUser } from '../lib/auth';

export default function AuthExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await authenticateUser(email, password);
    
    if (result.success) {
      setMessage('Login successful!');
      // Redirect or update UI as needed
    } else {
      setMessage(`Login failed: ${result.error}`);
    }
    
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const userData = {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    };

    const result = await registerUser(userData);
    
    if (result.success) {
      setMessage('Registration successful!');
      // Redirect or update UI as needed
    } else {
      setMessage(`Registration failed: ${result.error}`);
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    logoutUser();
    setMessage('Logged out successfully');
  };

  const checkAuthStatus = () => {
    const authenticated = isAuthenticated();
    setMessage(`Authentication status: ${authenticated ? 'Authenticated' : 'Not authenticated'}`);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full p-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
        >
          Switch to {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </div>

      <form onSubmit={isLogin ? handleLogin : handleSignup}>
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>

        {!isLogin && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!isLogin}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!isLogin}
              />
            </div>
          </>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>

      <div className="mt-4 space-y-2">
        <button
          onClick={checkAuthStatus}
          className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Check Auth Status
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded ${
          message.includes('successful') 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
