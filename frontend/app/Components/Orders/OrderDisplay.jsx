
'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  Calendar,
  Package,
  Truck,
  CreditCard,
  Receipt,
  MapPin,
  ShoppingCart,
  Printer,
  ListChecks,
} from 'lucide-react';
import { format } from 'date-fns';
import Tk_icon from '../Common/Tk_icon';

/**
 * @param {{order: {
 * order_number: string,
 * ordered_at: string,
 * status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
 * items: Array<{id: number, product: {name: string, image: string}, color: {name: string}|null, size: {name: string}|null, quantity: number, unit_price: string}>,
 * shipping_address: {full_address: string, city: string, country: string},
 * shipping_method: {name: string},
 * customer_name: string,
 * payment: {payment_method: string},
 * cart_subtotal: string,
 * total_amount: string,
 * tracking_number: string | null,
 * updates: Array<{status: string, notes: string, timestamp: string}>,
 * discount_amount: string
 * }}} props
 */
export default function OrderDisplay({ order }) {
  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Status color mapping using CSS custom properties
  const statusColor = {
    PENDING: 'bg-[var(--color-status-pending)]',
    PROCESSING: 'bg-[var(--color-status-processing)]',
    SHIPPED: 'bg-[var(--color-status-shipped)]',
    DELIVERED: 'bg-[var(--color-status-delivered)]',
    CANCELLED: 'bg-[var(--color-status-cancelled)]',
  };

  // Tracking history sub-component
  function TrackingHistory({ updates }) {
    return (
      <motion.ul
        className="flex flex-col gap-3"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {updates.map((update, idx) => (
          <motion.li
            key={idx}
            variants={itemVariants}
            className="flex items-start gap-3"
          >
            <ListChecks className="text-accent mt-1" size={18} />
            <div>
              <div className="font-medium text-sm">
                {update.status}
                <span className="ml-2 text-xs text-text-secondary">
                  {format(new Date(update.timestamp), 'PPpp')}
                </span>
              </div>
              {update.notes && (
                <div className="text-xs text-text-secondary mt-0.5">{update.notes}</div>
              )}
            </div>
          </motion.li>
        ))}
      </motion.ul>
    );
  }

  return (
    <motion.div
      className="bg-[var(--color-background)] text-text-primary min-h-screen py-8 px-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-[90rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Details */}
        <motion.div
          className="bg-[var(--color-second-bg)] rounded-lg p-6 border border-border flex flex-col gap-4"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="text-accent" size={22} />
            <h2 className="text-lg font-semibold">Order Details</h2>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <BadgeCheck size={18} />
            <span>Order Number:</span>
            <span className="font-mono">{order.order_number}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <Calendar size={18} />
            <span>Ordered At:</span>
            <span>{format(new Date(order.ordered_at), 'PPpp')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package size={18} />
            <span>Status:</span>
            <span className={`${statusColor[order.status] || 'bg-gray-400'} text-white px-2 py-1 rounded text-xs font-semibold`}>
              {order.status}
            </span>
          </div>
          {order.tracking_number && (
            <div className="flex items-center gap-2 text-text-secondary">
              <Package size={18} />
              <span>Tracking #:</span>
              <span className="font-mono">{order.tracking_number}</span>
            </div>
          )}
        </motion.div>

        {/* Order Items */}
        <motion.div
          className="bg-[var(--color-second-bg)] rounded-lg p-6 border border-border flex flex-col gap-4"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="text-accent" size={22} />
            <h2 className="text-lg font-semibold">Order Items</h2>
          </div>
          <motion.ul
            className="flex flex-col gap-4"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {order.items.map((item) => (
              <motion.li
                key={item.id}
                className="flex items-center gap-4"
                variants={itemVariants}
              >
                <div className="relative w-14 h-14 rounded border border-border overflow-hidden">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                    unoptimized={item.product.image && item.product.image.includes('.svg')}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.product.name}</div>
                  <div className="text-text-secondary text-sm flex gap-2">
                    <span>Qty: {item.quantity}</span>
                    {item.color && <span>Color: {item.color.name}</span>}
                    {item.size && <span>Size: {item.size.name}</span>}
                  </div>
                </div>
                <div className="font-semibold"><Tk_icon size={14} className="inline mr-1" />{parseFloat(item.unit_price).toFixed(2)}</div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Shipping & Payment */}
        <motion.div
          className="bg-[var(--color-second-bg)] rounded-lg p-6 border border-border flex flex-col gap-4"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-2 mb-2">
            <Truck className="text-accent" size={22} />
            <h2 className="text-lg font-semibold">Shipping & Payment</h2>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <MapPin size={18} />
            <span>Shipping Address:</span>
            <span className="font-medium">
              {order.shipping_address.full_address}, {order.shipping_address.city}, {order.shipping_address.country}
            </span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <Truck size={18} />
            <span>Shipping Method:</span>
            <span className="font-medium">{order.shipping_method.name}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <CreditCard size={18} />
            <span>Payment:</span>
            <span className="font-medium">{order.payment.payment_method}</span>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          className="bg-[var(--color-second-bg)] rounded-lg p-6 border border-border flex flex-col gap-4"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-2 mb-2">
            <Tk_icon className="text-accent" size={22} />
            <h2 className="text-lg font-semibold">Order Summary</h2>
          </div>
          <div className="flex flex-col gap-2 text-text-secondary">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span><Tk_icon size={14} className="inline mr-1" />{parseFloat(order.cart_subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="text-accent-green">-<Tk_icon size={14} className="inline mr-1" />{parseFloat(order.discount_amount).toFixed(2)}</span>
            </div>
            <div className="border-t border-border my-2"></div>
            <div className="flex justify-between font-semibold text-text-primary">
              <span>Grand Total</span>
              <span><Tk_icon size={16} className="inline mr-1" />{parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
          <button
            className="mt-4 flex items-center gap-2 bg-button-primary text-white px-4 py-2 rounded hover:opacity-90 transition"
            onClick={() => window.print()}
          >
            <Printer size={18} />
            Print Invoice
          </button>
        </motion.div>

        {/* Tracking History */}
        <motion.div
          className="bg-[var(--color-second-bg)] rounded-lg p-6 border border-border flex flex-col gap-4 md:col-span-2"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="text-accent" size={22} />
            <h2 className="text-lg font-semibold">Tracking History</h2>
          </div>
          {order.updates && order.updates.length > 0 ? (
            <TrackingHistory updates={order.updates} />
          ) : (
            <div className="text-text-secondary text-sm">No tracking updates yet.</div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}