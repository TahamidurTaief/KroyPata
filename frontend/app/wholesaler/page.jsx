"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiBriefcase,
  FiFileText,
  FiUpload,
  FiArrowLeft,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { useAuth } from "@/app/contexts/AuthContext";
import { useModal } from "@/app/contexts/ModalContext";
import { registerWholeseller } from "@/app/lib/api";
import { flushSync } from "react-dom";

export default function WholesalerPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { showModal } = useModal();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    business_name: "",
    business_type: "",
    trade_license: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Store the page user came from
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
    
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
  }, [isAuthenticated, router]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        trade_license: files[0],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.password !== formData.confirmPassword) {
      showModal({
        status: "error",
        title: "Password Mismatch",
        message: "Passwords do not match. Please ensure both password fields are identical.",
        primaryActionText: "Try Again",
        onPrimaryAction: () => {},
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      payload.append("password", formData.password);
      payload.append("business_name", formData.business_name);
      payload.append("business_type", formData.business_type);
      if (formData.trade_license) {
        payload.append("trade_license", formData.trade_license);
      }

      const response = await registerWholeseller(payload);
      console.log("Wholesaler registration response:", response);

      if (response.error || response.errors) {
        let errorMessage = response.error || "Registration failed";
        if (response.errors) {
          const errorDetails = [];
          Object.entries(response.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorDetails.push(`${field}: ${messages.join(", ")}`);
            } else {
              errorDetails.push(`${field}: ${messages}`);
            }
          });
          errorMessage = errorDetails.join("\n") || errorMessage;
        }

        showModal({
          status: "error",
          title: "Registration Failed",
          message: errorMessage,
          primaryActionText: "Try Again",
          onPrimaryAction: () => {},
        });
        setIsSubmitting(false);
        return;
      }

      // Auto-login with success message
      if (response.tokens && response.user) {
        flushSync(() => {
          login(response.user, {
            access: response.tokens.access,
            refresh: response.tokens.refresh,
          });
        });

        showModal({
          status: "success",
          title: "Registration Successful!",
          message:
            "Welcome! Your wholesaler account has been created and is pending admin approval.",
          primaryActionText: "Continue",
          onPrimaryAction: () => {
            // Redirect back to previous page or home
            const redirectPath = typeof window !== 'undefined' 
              ? (sessionStorage.getItem('redirectAfterLogin') || localStorage.getItem('redirectAfterLogin') || '/')
              : '/';
            
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('redirectAfterLogin');
              localStorage.removeItem('redirectAfterLogin');
            }
            
            router.push(redirectPath);
          },
        });
      }
    } catch (err) {
      console.error("Wholesaler registration error:", err);
      showModal({
        status: "error",
        title: "Unexpected Error",
        message: err.message || "An unexpected error occurred. Please try again.",
        primaryActionText: "Try Again",
        onPrimaryAction: () => {},
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 py-8">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"
          alt="Business Background"
          fill
          className="object-cover"
          priority
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-blue-900/70 to-black/70 backdrop-blur-sm" />
      </div>

      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-lg transition-all border border-white/20 text-sm"
      >
        <FiArrowLeft size={18} />
        <span className="font-medium">Back to Home</span>
      </Link>

      {/* Wholesaler Registration Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          
          {/* Compact Header - No separate box */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <FiBriefcase size={24} />
              <div>
                <h1 className="text-xl font-bold">Join as Wholesaler</h1>
                <p className="text-sm text-blue-100">Grow your business with us</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(100vh-180px)] overflow-y-auto">{/* Personal Information Section */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiUser className="text-blue-600" size={18} />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Full Name *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Email Address *
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Password *
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
                      placeholder="Create a password"
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
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Confirm Password *
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-11 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Business Information Section */}
            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiBriefcase className="text-purple-600" size={18} />
                Business Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Business Name */}
                <div>
                  <label
                    htmlFor="business_name"
                    className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Business Name *
                  </label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      id="business_name"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Your business name"
                    />
                  </div>
                </div>

                {/* Business Type */}
                <div>
                  <label
                    htmlFor="business_type"
                    className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Business Type
                  </label>
                  <div className="relative">
                    <FiFileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      id="business_type"
                      name="business_type"
                      value={formData.business_type}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="E.g., Retail, Distribution"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiUpload className="text-green-600" size={18} />
                Trade License Document *
              </h3>

              <div
                className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${
                  dragActive
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-green-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  name="trade_license"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleInputChange}
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <div>
                    {formData.trade_license ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          ✓ File Selected
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 break-all px-4">
                          📄 {formData.trade_license.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Click or drag to replace
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, JPG, PNG, DOC up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className={`w-full py-3 rounded-lg font-bold text-sm text-white transition-all ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting Application...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FiBriefcase size={18} />
                  Join as Wholesaler
                </div>
              )}
            </motion.button>

            {/* Terms Text */}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 -mt-2">
              By signing up, you agree to our terms and conditions.
            </p>

            {/* Login Links */}
            <div className="text-center pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1.5">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Login
                </Link>
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Want a regular account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
