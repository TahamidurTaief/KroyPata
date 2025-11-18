// app/Components/Cart/CheckoutProcess.jsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMessage } from "@/context/MessageContext";
import { motion } from "framer-motion";
import Link from "next/link";
import CartTotals from "./CartTotals";
import CartCoupon from "./CartCoupon";
import CheckoutSteps from "./CheckoutSteps";
import CheckoutForm from "./CheckoutForm";
import OrderPaymentModal from "../Payment/OrderPaymentModal";
import PaymentMethods from "./PaymentMethods";
import { CouponData } from "@/app/lib/Data/CouponData";
import { CheckCircle } from "lucide-react";

// This master component controls the entire checkout flow, from details to confirmation.
const CheckoutProcess = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { showSuccess, showError } = useMessage();

  const [cartItems, setCartItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", city: "", zip: "" });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedCart = localStorage.getItem("cartItems");
    if (storedCart) setCartItems(JSON.parse(storedCart));
  }, []);

  const { subtotal, shippingCost, discountAmount, total } = useMemo(() => {
    const sub = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = selectedShippingMethod ? parseFloat(selectedShippingMethod.price) : 0;
    let discount = 0;
    if (appliedCoupon && sub >= (appliedCoupon.conditions?.minPurchase || 0)) {
      discount = sub * (appliedCoupon.discountValue / 100);
    }
    return {
      subtotal: sub,
      shippingCost: shipping,
      discountAmount: discount,
      total: sub + shipping - discount,
    };
  }, [cartItems, appliedCoupon, selectedShippingMethod]);

  const handleApplyCoupon = (code) => {
    const coupon = CouponData.find((c) => c.code.toLowerCase() === code.toLowerCase());
    if (coupon) {
      setAppliedCoupon(coupon);
      showSuccess(`Coupon "${coupon.code}" applied!`, 'Coupon Applied');
    } else {
      showError("Invalid coupon code.", "Invalid Coupon");
    }
  };

  const handlePaymentSelection = (method) => {
    const isFormValid = Object.values(formData).every((field) => field.trim() !== "");
    const isShippingSelected = selectedShippingMethod !== null;
    
    if (!isFormValid) {
      showError("Please fill out all delivery details first.", "Missing Information");
      return;
    }
    
    if (!isShippingSelected) {
      showError("Please select a shipping method.", "Missing Shipping Method");
      return;
    }
    
    setSelectedPaymentMethod(method);
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = (response) => {
    console.log("Order Confirmed:", {
      response,
      deliveryDetails: formData,
      orderItems: cartItems,
      orderTotal: total,
      shippingMethod: selectedShippingMethod,
    });

    showSuccess("Order Placed Successfully!", "Order Confirmed");
    localStorage.removeItem("cartItems"); // Clear cart after successful order
    
    // The OrderPaymentModal will handle redirection to confirmation page
    // No need to manually redirect here since redirectToConfirmation={true}
  };

  const getCurrentStep = () => {
    if (pathname === "/checkout") return 2;
    if (pathname === "/confirmation") return 3;
    return 2; // Default to checkout step
  };

  if (!mounted) return null;

  const renderContent = () => {
    if (pathname === "/checkout") {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <CheckoutForm
              formData={formData}
              onFormChange={setFormData}
              selectedShippingMethod={selectedShippingMethod}
              onShippingMethodChange={setSelectedShippingMethod}
            />
          </div>
          <div className="lg:col-span-1 sticky top-24">
            <div className="bg-background rounded-xl border border-border shadow-lg p-6 space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Order Summary</h2>
              <CartTotals
                subtotal={subtotal}
                shipping={shippingCost}
                discount={discountAmount}
                total={total}
                shippingMethodName={selectedShippingMethod?.name || selectedShippingMethod?.title}
                selectedShippingMethod={selectedShippingMethod}
                showShipping={true}
              />
              <div className="border-t border-border"></div>
              <CartCoupon onApplyCoupon={handleApplyCoupon} appliedCoupon={appliedCoupon} />
              <div className="border-t border-border"></div>
              <PaymentMethods selectedMethod={selectedPaymentMethod} onSelect={handlePaymentSelection} />
            </div>
          </div>
        </div>
      );
    }

    if (pathname === "/confirmation") {
      return (
        <div className="text-center bg-background p-10 rounded-xl border border-border max-w-2xl mx-auto shadow-lg">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h1 className="text-4xl font-bold text-foreground mb-4">Thank You!</h1>
            <p className="text-lg text-muted-foreground mb-8">Your order has been placed successfully.</p>
            <Link href="/products" passHref>
              <motion.button
                className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-lg hover:bg-primary/90"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.05 }}
              >
                continue 
              </motion.button>
            </Link>
          </motion.div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSteps currentStep={getCurrentStep()} />
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {renderContent()}
      </motion.div>
      <OrderPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        cartItems={cartItems}
        totalAmount={total}
        cartSubtotal={subtotal}
        shippingMethod={selectedShippingMethod}
        shippingAddress={null} // You may want to create this from formData
        userDetails={{
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }}
        onSuccess={handleConfirmPayment}
        redirectToConfirmation={true}
      />
    </div>
  );
};

export default CheckoutProcess;
