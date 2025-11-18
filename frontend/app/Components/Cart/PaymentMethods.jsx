"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import bkashLogo from "@/public/img/payment/bkash.png";
import nagadLogo from "@/public/img/payment/nagad.png";
import cardLogo from "@/public/img/payment/card.png";

const paymentOptions = [
  { id: "bkash", name: "bKash", logo: bkashLogo },
  { id: "nagad", name: "Nagad", logo: nagadLogo },
  { id: "card", name: "Card", logo: cardLogo },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const PaymentMethods = ({ selectedMethod, onSelect }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
        Payment Method
      </h3>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {paymentOptions.map((option) => (
          <motion.div key={option.id} variants={itemVariants}>
            <label
              htmlFor={option.id}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 transform hover:scale-105
                ${
                  selectedMethod === option.id
                    ? "border-[var(--color-button-primary)] bg-blue-500/10 ring-2 ring-[var(--color-button-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-second-bg)] hover:border-[var(--color-text-secondary)]"
                }`}
            >
              <input
                type="radio"
                id={option.id}
                name="payment-option"
                value={option.id}
                checked={selectedMethod === option.id}
                onChange={() => onSelect(option.id)}
                className="hidden"
              />
              <Image
                src={option.logo}
                alt={`${option.name} logo`}
                width={80}
                height={40}
                className="object-contain mb-2"
              />
              <p className="font-semibold text-[var(--color-text-primary)]">
                Pay with {option.name}
              </p>
            </label>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PaymentMethods;
