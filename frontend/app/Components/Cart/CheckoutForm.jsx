// app/Components/Cart/CheckoutForm.jsx
"use client";

import { motion } from "framer-motion";

const CheckoutForm = ({ formData, onFormChange, validationErrors = {} }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFormChange({ ...formData, [name]: value });
  };

  return (
    <div className="space-y-6">
      
      {/* Account Details */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--cart-card-bg)' }}>
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-sm font-bold mb-3" 
          style={{ color: 'var(--cart-text-primary)' }}
        >
          1. Account Details
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="Full Name *"
              className={`px-3 py-2 text-sm rounded outline-none transition-colors w-full ${
                validationErrors.name ? 'border-red-500' : ''
              }`}
              style={{ 
                backgroundColor: 'var(--cart-input-bg)', 
                color: 'var(--cart-text-primary)',
                border: validationErrors.name ? '1px solid #ef4444' : '1px solid var(--cart-input-border)'
              }}
              required
            />
            {validationErrors.name && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
            )}
          </div>
          <div>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              placeholder="Email Address *"
              className={`px-3 py-2 text-sm rounded outline-none transition-colors w-full ${
                validationErrors.email ? 'border-red-500' : ''
              }`}
              style={{ 
                backgroundColor: 'var(--cart-input-bg)', 
                color: 'var(--cart-text-primary)',
                border: validationErrors.email ? '1px solid #ef4444' : '1px solid var(--cart-input-border)'
              }}
              required
            />
            {validationErrors.email && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              placeholder="Phone Number *"
              className={`px-3 py-2 text-sm rounded outline-none transition-colors w-full ${
                validationErrors.phone ? 'border-red-500' : ''
              }`}
              style={{ 
                backgroundColor: 'var(--cart-input-bg)', 
                color: 'var(--cart-text-primary)',
                border: validationErrors.phone ? '1px solid #ef4444' : '1px solid var(--cart-input-border)'
              }}
              required
            />
            {validationErrors.phone && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--cart-card-bg)' }}>
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-sm font-bold mb-3" 
          style={{ color: 'var(--cart-text-primary)' }}
        >
          2. Delivery Address
        </motion.h3>
        <div className="space-y-3">
          <div>
            <input
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={handleInputChange}
              placeholder="Street Address *"
              className={`w-full px-3 py-2 text-sm rounded outline-none transition-colors ${
                validationErrors.address ? 'border-red-500' : ''
              }`}
              style={{ 
                backgroundColor: 'var(--cart-input-bg)', 
                color: 'var(--cart-text-primary)',
                border: validationErrors.address ? '1px solid #ef4444' : '1px solid var(--cart-input-border)'
              }}
              required
            />
            {validationErrors.address && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.address}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleInputChange}
                placeholder="City *"
                className={`w-full px-3 py-2 text-sm rounded outline-none transition-colors ${
                  validationErrors.city ? 'border-red-500' : ''
                }`}
                style={{ 
                  backgroundColor: 'var(--cart-input-bg)', 
                  color: 'var(--cart-text-primary)',
                  border: validationErrors.city ? '1px solid #ef4444' : '1px solid var(--cart-input-border)'
                }}
                required
              />
              {validationErrors.city && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.city}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                name="state"
                value={formData.state || ''}
                onChange={handleInputChange}
                placeholder="State/Division *"
                className={`w-full px-3 py-2 text-sm rounded outline-none transition-colors ${
                  validationErrors.state ? 'border-red-500' : ''
                }`}
                style={{ 
                  backgroundColor: 'var(--cart-input-bg)', 
                  color: 'var(--cart-text-primary)',
                  border: validationErrors.state ? '1px solid #ef4444' : '1px solid var(--cart-input-border)'
                }}
                required
              />
              {validationErrors.state && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.state}</p>
              )}
            </div>
          </div>
          <div>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode || ''}
              onChange={handleInputChange}
              placeholder="ZIP Code *"
              className={`w-full px-3 py-2 text-sm rounded outline-none transition-colors ${
                validationErrors.zipCode ? 'border-red-500' : ''
              }`}
              style={{ 
                backgroundColor: 'var(--cart-input-bg)', 
                color: 'var(--cart-text-primary)',
                border: validationErrors.zipCode ? '1px solid #ef4444' : '1px solid var(--cart-input-border)'
              }}
              required
            />
            {validationErrors.zipCode && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.zipCode}</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default CheckoutForm;