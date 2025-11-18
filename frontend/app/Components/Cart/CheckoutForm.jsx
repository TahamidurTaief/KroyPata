"use client";

import { motion } from "framer-motion";
import FormField from "../Common/FormField";
import { ShippingMethodSelector } from "../index";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const CheckoutForm = ({
  formData,
  onFormChange,
  selectedShippingMethod,
  onShippingMethodChange,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFormChange({ ...formData, [name]: value });
  };

  return (
    <motion.div
      className="bg-[var(--color-second-bg)] p-6 rounded-xl border border-[var(--color-border)] space-y-8 "
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Section for Delivery Details */}
      <form className="space-y-6">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-4">
          Delivery Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="name"
            label="Your Name"
            placeholder="Bonnie Green"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <FormField
            id="email"
            label="Your Email"
            type="email"
            placeholder="name@flowbite.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <FormField
            id="phone"
            label="Phone Number"
            type="tel"
            placeholder="+1 23-456-789"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
          <FormField
            id="address"
            label="Address"
            placeholder="123 Main St"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
          <FormField
            id="city"
            label="City"
            placeholder="San Francisco"
            value={formData.city}
            onChange={handleInputChange}
            required
          />
          <FormField
            id="zip"
            label="ZIP / Postal Code"
            placeholder="12345"
            value={formData.zip}
            onChange={handleInputChange}
            required
          />
        </div>
      </form>

      <div className="border-t border-[var(--color-border)]"></div>

      {/* Section for Delivery Method */}
      <ShippingMethodSelector
        onSelectionChange={onShippingMethodChange}
        selectedMethodId={selectedShippingMethod?.id}
        title="Delivery Method"
        className="space-y-4"
      />
    </motion.div>
  );
};

export default CheckoutForm;
