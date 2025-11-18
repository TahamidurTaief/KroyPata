// app/Components/Cart/ShippingOptions.jsx
"use client";

import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";
import Tk_icon from '../Common/Tk_icon';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const ShippingOptions = ({ options, selectedId, onSelect, cartAnalysis = null }) => {
  return (
    <div>
      <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-3">
        Delivery Method
      </h3>
      <motion.div
        className="space-y-1 flex flex-col sm:flex-row w-full gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {options.map((option) => (
          <motion.div key={option.id} variants={itemVariants}>
            <label
              htmlFor={option.id}
              className={`flex flex-row sm:flex-col items-center lato gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedId === option.id
                  ? "border-[var(--color-button-primary)] bg-blue-500/10"
                  : "border-[var(--color-border)] bg-[var(--color-second-bg)] hover:border-[var(--color-text-secondary)]"
              }`}
            >
              <input
                type="radio"
                id={option.id}
                name="shipping-option"
                value={option.id}
                checked={selectedId === option.id}
                onChange={() => onSelect(option.id)}
                className="hidden lato"
              />
              <div className="flex flex-col">
                <p className="font-semibold text-[var(--color-text-primary)]">
                  {option.name}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {option.description}
                </p>
                {option.pricingExplanation && (
                  <p className="text-xs text-[var(--color-text-secondary)] italic mt-1">
                    {option.pricingExplanation}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[var(--color-text-primary)] flex items-center">
                  <Tk_icon size={18} className="mr-1" />{option.price.toFixed(2)}
                </span>
                {selectedId === option.id && (
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                    <FiCheckCircle className="text-[var(--color-button-primary)] text-xl" />
                  </motion.div>
                )}
              </div>
            </label>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ShippingOptions;
