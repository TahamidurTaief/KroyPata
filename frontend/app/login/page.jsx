"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiMail, FiLock, FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "@/app/contexts/AuthContext";
import { useModal } from "@/app/contexts/ModalContext";
import { loginUser } from "@/app/lib/api";
import { flushSync } from "react-dom";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { showModal } = useModal();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Store the page user came from
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      const currentOrigin = window.location.origin;
      
      // If coming from same site, store the previous path
      if (referrer && referrer.startsWith(currentOrigin)) {
        const previousPath = referrer.replace(currentOrigin, '');
        if (previousPath && previousPath !== '/login' && previousPath !== '/signup' && previousPath !== '/wholesaler') {
          sessionStorage.setItem('redirectAfterLogin', previousPath);
        }
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const loginResponse = await loginUser(formData.email, formData.password);
      
      if (loginResponse.error) {
        showModal({
          status: 'error',
          title: 'Login Failed',
          message: 'Invalid credentials. Please check your email and password.',
          primaryActionText: 'Try Again',
          onPrimaryAction: () => {},
        });
        setIsSubmitting(false);
        return;
      }

      // Force immediate authentication state update
      flushSync(() => {
        login(loginResponse.user, {
          access: loginResponse.access,
          refresh: loginResponse.refresh
        });
      });
      
      // Redirect back to previous page or home
      const redirectPath = typeof window !== 'undefined' 
        ? (sessionStorage.getItem('redirectAfterLogin') || localStorage.getItem('redirectAfterLogin') || '/')
        : '/';
      
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('redirectAfterLogin');
        localStorage.removeItem('redirectAfterLogin');
      }
      
      router.push(redirectPath);
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.message) {
        if (error.message.includes('credentials') || error.message.includes('401')) {
          errorMessage = "Invalid credentials. Please check your email and password.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Connection error. Please check your internet connection.";
        }
      }

      showModal({
        status: 'error',
        title: 'Login Failed',
        message: errorMessage,
        primaryActionText: 'Try Again',
        onPrimaryAction: () => {},
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2070"
          alt="Shopping Background"
          fill
          className="object-cover"
          priority
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070";
          }}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-lg transition-all border border-white/20 text-sm"
      >
        <FiArrowLeft size={18} />
        <span className="font-medium">Back to Home</span>
      </Link>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sign in to your account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-11 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className={`w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-all ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </div>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
            <span className="mx-3 text-xs text-gray-500 dark:text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
          </div>

          {/* Wholesaler Link */}
          <Link href="/wholesaler">
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all"
            >
              Become a Wholesaler
            </motion.button>
          </Link>

          {/* Sign Up Link */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
