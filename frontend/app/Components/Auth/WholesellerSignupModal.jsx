import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUpload, FiUser, FiBriefcase, FiMail, FiPhone, FiLock, FiFileText } from "react-icons/fi";
import { useAuth } from "@/app/contexts/AuthContext";
import { useModal } from "@/app/contexts/ModalContext";
import { useMessage } from "@/context/MessageContext";
import { registerWholeseller } from "@/app/lib/api";
import { flushSync } from "react-dom";

const WholesellerSignupModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
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
        message: "Passwords do not match.",
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
      console.log('Wholeseller registration response:', response);
      
      if (response.error || response.errors) {
        let errorMessage = response.error || 'Registration failed';
        if (response.errors) {
          const errorDetails = [];
          Object.entries(response.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorDetails.push(`${field}: ${messages.join(', ')}`);
            } else {
              errorDetails.push(`${field}: ${messages}`);
            }
          });
          errorMessage = errorDetails.join('\n') || errorMessage;
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
          message: "Welcome! Your wholeseller account has been created and is pending admin approval.",
          primaryActionText: "Continue",
          onPrimaryAction: () => {},
        });
        
        onClose();
      }
    } catch (err) {
      showModal({
        status: "error",
        title: "Unexpected Error",
        message: err.message,
        primaryActionText: "Try Again",
        onPrimaryAction: () => {},
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl max-w-2xl w-full shadow-2xl relative overflow-hidden border border-blue-100 dark:border-gray-700"
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-3xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <FiX size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <FiBriefcase size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Join as Wholeseller</h2>
                  <p className="text-blue-100">Grow your business with us</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <FiUser className="text-blue-600" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Email Address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone (Optional)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Password"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Confirm Password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <FiBriefcase className="text-purple-600" />
                  Business Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Business Name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div className="relative">
                    <FiFileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="business_type"
                      value={formData.business_type}
                      onChange={handleInputChange}
                      placeholder="Business Type (Optional)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <FiUpload className="text-green-600" />
                  Trade License Document
                </h3>
                
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
                    dragActive
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-gray-300 hover:border-green-400"
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
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.trade_license ? (
                          <span className="text-green-600 font-medium">
                            📄 {formData.trade_license.name}
                          </span>
                        ) : (
                          <>
                            <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, JPG, PNG, DOC up to 5MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`w-full font-bold py-4 px-6 rounded-xl text-white transition-all ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105"
                }`}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <FiBriefcase />
                    Join as Wholeseller
                  </div>
                )}
              </motion.button>

              <p className="text-xs text-center text-gray-500 mt-4">
                By signing up, you agree to our terms and conditions. Your account will be reviewed by our team.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WholesellerSignupModal;
