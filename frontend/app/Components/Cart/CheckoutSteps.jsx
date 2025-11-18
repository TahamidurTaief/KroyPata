"use client";

import { motion } from "framer-motion";
import { FiShoppingCart, FiCreditCard, FiCheckCircle } from "react-icons/fi";

const steps = [
  { id: 1, name: "Shopping Cart", icon: FiShoppingCart },
  { id: 2, name: "Checkout", icon: FiCreditCard },
  { id: 3, name: "Confirmation", icon: FiCheckCircle },
];

const CheckoutSteps = ({ currentStep }) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="relative">
        {/* Progress Bar */}
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-[var(--color-border)] transform -translate-y-1/2"></div>
        <div
          className="absolute left-0 top-1/2 h-0.5 bg-[var(--color-button-primary)] transform -translate-y-1/2 transition-all duration-500"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        ></div>

        <div className="relative flex justify-between items-center">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center z-10">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{
                  scale: currentStep >= step.id ? 1 : 0.8,
                  backgroundColor:
                    currentStep >= step.id
                      ? "var(--color-button-primary)"
                      : "var(--color-second-bg)",
                  borderColor:
                    currentStep >= step.id
                      ? "var(--color-button-primary)"
                      : "var(--color-border)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
              >
                <step.icon
                  className={`text-lg ${
                    currentStep >= step.id
                      ? "text-white"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                />
              </motion.div>
              <p
                className={`mt-2 text-xs sm:text-sm text-center font-medium ${
                  currentStep >= step.id
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                {step.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CheckoutSteps;
