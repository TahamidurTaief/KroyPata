// app/Components/Cart/CartServices.jsx
"use client";
import { FiTruck, FiPhone, FiMessageSquare, FiGift } from "react-icons/fi";

const services = [
  {
    icon: <FiTruck className="w-6 h-6" />,
    title: "Free Shipping",
    desc: "When you spend $50+",
    color: "bg-pink-100 text-pink-600"
  },
  {
    icon: <FiPhone className="w-6 h-6" />,
    title: "Call Us Anytime",
    desc: "+34 555 5555",
    color: "bg-orange-100 text-orange-600"
  },
  {
    icon: <FiMessageSquare className="w-6 h-6" />,
    title: "Chat With Us",
    desc: "We offer 24-hour chat support",
    color: "bg-green-100 text-green-600"
  },
  {
    icon: <FiGift className="w-6 h-6" />,
    title: "Gift Cards",
    desc: "For your loved one, in any amount",
    color: "bg-yellow-100 text-yellow-600"
  }
];

const CartServices = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8 lg:mt-10">
      {services.map((service, index) => (
        <div key={index} className="rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4 shadow-sm" style={{ backgroundColor: 'var(--cart-card-bg)', boxShadow: '0 1px 3px var(--cart-shadow)' }}>
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${service.color}`}>
            {service.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs sm:text-sm" style={{ color: 'var(--cart-text-primary)' }}>{service.title}</h4>
            <p className="text-xs mt-1" style={{ color: 'var(--cart-text-secondary)' }}>{service.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartServices;