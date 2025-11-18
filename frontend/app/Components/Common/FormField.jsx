"use client";

import { motion } from "framer-motion";

const formFieldVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const FormField = ({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  children,
  colSpan = "sm:col-span-1",
}) => {
  return (
    <motion.div variants={formFieldVariants} className={colSpan}>
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-medium text-[var(--color-text-secondary)]"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children ? (
        children
      ) : (
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          className="block w-full p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-second-bg)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-button-primary)] transition-shadow"
          placeholder={placeholder}
          required={required}
        />
      )}
    </motion.div>
  );
};

export default FormField;
