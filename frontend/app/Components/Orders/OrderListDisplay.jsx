'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeCheck,
  Calendar,
  Package,
  X,
  Truck,
  ListChecks,
  FileText,
  Clock,
  MapPin,
  Hash,
  Layers,
  ClipboardList,
  Download,
  CheckCircle,
  Circle,
  Phone,
  Mail,
  Home,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { getUserOrders, getCurrentUserOrders } from '@/app/lib/api.js';
import Tk_icon from '../Common/Tk_icon';
import OrderPageSkeleton from './OrderPageSkeleton';

export default function OrderListDisplay() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { isAuthenticated, openAuthModal, user } = useAuth();
  const invoiceRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    
    async function fetchOrders() {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!isAuthenticated) {
          console.log('OrderListDisplay: User not authenticated');
          setOrders([]);
          setIsLoading(false);
          return;
        }
        
        console.log('OrderListDisplay: Fetching orders for authenticated user');
        
        let data;
        if (user?.id) {
          console.log('OrderListDisplay: Using getUserOrders with user ID:', user.id);
          data = await getUserOrders(user.id);
        } else {
          console.log('OrderListDisplay: Using getCurrentUserOrders');
          data = await getCurrentUserOrders();
        }
        
        console.log('OrderListDisplay: Orders fetched:', data);
        
        if (!ignore) {
          if (data && data.error) {
            console.error('OrderListDisplay: Error fetching orders:', data.error);
            setError(data.error);
            setOrders([]);
            if (data.error.includes('Authentication required') || data.error.includes('login')) {
              setError(null);
              openAuthModal('login');
            }
          } else if (Array.isArray(data)) {
            console.log('OrderListDisplay: Setting orders:', data.length, 'orders');
            // Sort orders by most recent first
            const sortedOrders = data.sort((a, b) => new Date(b.ordered_at) - new Date(a.ordered_at));
            setOrders(sortedOrders);
          } else {
            console.log('OrderListDisplay: Unexpected data format:', data);
            setOrders([]);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error('OrderListDisplay: Failed to fetch orders:', err);
          setError(err.message || 'Failed to load orders');
          setOrders([]);
          
          if (err.message && err.message.includes('Authentication')) {
            openAuthModal('login');
          }
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    
    const timeoutId = setTimeout(fetchOrders, 100);
    return () => { 
      ignore = true; 
      clearTimeout(timeoutId);
    };
  }, [isAuthenticated, user?.id, openAuthModal]);

  // Status color mapping using CSS custom properties
  const statusColor = {
    PENDING: 'bg-[var(--color-status-pending)]',
    PROCESSING: 'bg-[var(--color-status-processing)]',
    SHIPPED: 'bg-[var(--color-status-shipped)]',
    DELIVERED: 'bg-[var(--color-status-delivered)]',
    CANCELLED: 'bg-[var(--color-status-cancelled)]',
  };

  // Invoice generation function - Simple and Dynamic
  const generateInvoice = (order, downloadPDF = false) => {
    // Validation
    if (!order || !order.order_number) {
      console.error('Invalid order data for invoice generation');
      return;
    }

    // Tk icon SVG
    const tkIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" style="display: inline-block; vertical-align: middle; margin-right: 2px;"><path d="M198.4 72.3c7.9 11.6 15 30.3 15 57.9v89.6h23.9l40.1 40.9h-64v116c0 9.1 3.4 17.3 10.2 24.7s17.9 11.1 33.3 11.1c19.9 0 40.9-11.1 63.1-33.3 22.7-22.7 34.7-46 35.8-69.9l-10.2.9c-36.4 0-54.6-19.3-54.6-58 0-13.1 4.3-24.7 12.8-35 8.5-10.2 22.7-15.4 42.6-15.4 21 0 38.7 9.1 52.9 27.3 14.8 18.2 22.2 40.4 22.2 66.5 0 38.7-16.5 75.6-49.5 110.9-32.4 35.2-94.4 52.9-116 52.9-34.6 0-47.9-6.8-59.2-14.5-11.3-7.8-26.1-26.2-26.1-49.4V260.7h-40.9l-39.2-40.9h80.2v-81c0-18.1-18.1-28-29.9-29-7.2-.6-15.1 1.4-17.9 4.3-5.1-8.5-10-18.8-14.5-30.7 0 0 4-14.4 17.1-23 9-5.9 17.5-7.7 30.7-7.7 25.1-.1 36.7 11.7 42.1 19.6z" fill="currentColor" /></svg>`;
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice - ${order.order_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 30px; color: #1f2937; background: #ffffff; }
          .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border: 1px solid #e5e7eb; }
          
          /* Header */
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #2563eb; }
          .company-logo { width: 150px; height: auto; max-height: 60px; object-fit: contain; margin-bottom: 10px; }
          .company-info h1 { color: #1f2937; font-size: 24px; margin-bottom: 8px; font-weight: 700; }
          .company-info p { color: #6b7280; font-size: 13px; line-height: 1.6; }
          .invoice-info { text-align: right; }
          .invoice-info h2 { color: #2563eb; font-size: 20px; margin-bottom: 12px; font-weight: 700; }
          .invoice-meta { color: #374151; font-size: 13px; line-height: 1.8; }
          .invoice-meta strong { color: #1f2937; font-weight: 600; }
          
          /* Status Badge */
          .status-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; color: white; text-transform: uppercase; margin-top: 8px; }
          .status-pending { background: #f59e0b; }
          .status-processing { background: #2563eb; }
          .status-shipped { background: #8b5cf6; }
          .status-delivered { background: #10b981; }
          .status-cancelled { background: #ef4444; }
          
          /* Order Info */
          .order-info { margin-bottom: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #2563eb; }
          .order-info h3 { color: #1f2937; font-size: 14px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
          .info-label { color: #6b7280; font-weight: 500; }
          .info-value { color: #1f2937; font-weight: 600; }
          
          /* Table */
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          thead { background: #2563eb; color: white; }
          th { padding: 14px 12px; text-align: left; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.3px; }
          td { padding: 14px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #374151; }
          tbody tr:last-child td { border-bottom: none; }
          .item-name { font-weight: 600; color: #1f2937; }
          .item-details { font-size: 12px; color: #6b7280; margin-top: 4px; }
          
          /* Totals */
          .totals-section { margin-top: 20px; padding-top: 20px; border-top: 2px solid #2563eb; }
          .total-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; }
          .total-label { font-size: 16px; font-weight: 700; color: #1f2937; }
          .total-amount { font-size: 24px; font-weight: 700; color: #2563eb; }
          
          /* Footer */
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; }
          .footer p { color: #6b7280; font-size: 12px; line-height: 1.6; }
          .footer strong { color: #1f2937; }
          
          /* Print Styles */
          @media print {
            body { padding: 20px; background: white; }
            .invoice-container { border: none; padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="header">
            <div class="company-info">
              <img src="/img/logo_light.svg" alt="Logo" class="company-logo" style="width: 150px; height: 60px; object-fit: contain;" />
              <p style="margin-top: 12px; font-size: 13px; color: #374151;">Email: support@icommerce.com</p>
              <p style="font-size: 13px; color: #374151;">Phone: +880 1XXX-XXXXXX</p>
              <p style="font-size: 13px; color: #374151;">Dhaka, Bangladesh</p>
            </div>
            <div class="invoice-info">
              <h2>INVOICE</h2>
              <div class="invoice-meta">
                <div><strong>Order #:</strong> ${order.order_number || 'N/A'}</div>
                <div><strong>Date:</strong> ${order.ordered_at ? format(new Date(order.ordered_at), 'PPP') : 'N/A'}</div>
                <div><strong>Time:</strong> ${order.ordered_at ? format(new Date(order.ordered_at), 'p') : 'N/A'}</div>
              </div>
              <div class="status-badge status-${(order.status || 'pending').toLowerCase()}">${order.status || 'PENDING'}</div>
            </div>
          </div>

          <!-- Order Details - Compact Format -->
          <div style="margin: 20px 0; padding: 15px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 2;">
              ${order.payment ? `<strong style="color: #1f2937;">Payment:</strong> ${order.payment.payment_method_display || order.payment.payment_method || 'N/A'}` : ''}${order.payment && order.payment.payment_method !== 'cod' && order.payment.payment_method_display !== 'Cash on Delivery' ? (order.payment.admin_account_number ? ` (Admin: ${order.payment.admin_account_number})` : '') + (order.payment.sender_number ? ` &nbsp;•&nbsp; Sender: ${order.payment.sender_number}` : '') + (order.payment.transaction_id ? ` &nbsp;•&nbsp; TxID: ${order.payment.transaction_id}` : '') : ''}${order.shipping_method_name ? ` &nbsp;•&nbsp; <strong style="color: #1f2937;">Shipping:</strong> ${order.shipping_method_name}` : ''}<br/>${order.cash_on_delivery && order.cash_on_delivery.delivery_status ? `<strong style="color: #1f2937;">Delivery:</strong> ${order.cash_on_delivery.delivery_status_display || order.cash_on_delivery.delivery_status}` : ''}${order.cash_on_delivery && order.cash_on_delivery.scheduled_delivery_date ? ` (${format(new Date(order.cash_on_delivery.scheduled_delivery_date), 'PP')})` : ''}${order.cash_on_delivery && order.cash_on_delivery.amount_to_collect ? ` &nbsp;•&nbsp; <strong style="color: #1f2937;">Collect:</strong> ${tkIconSvg}${parseFloat(order.cash_on_delivery.amount_to_collect || 0).toFixed(2)}` : ''}${order.payment && (order.payment.payment_method === 'cod' || order.payment.payment_method_display === 'Cash on Delivery') ? ` &nbsp;•&nbsp; <strong style="color: #1f2937;">Delivery Team:</strong> ${order.cash_on_delivery && order.cash_on_delivery.delivery_person_name ? order.cash_on_delivery.delivery_person_name + (order.cash_on_delivery.delivery_person_phone ? ' (' + order.cash_on_delivery.delivery_person_phone + ')' : '') : 'Not Declared'}` : ''}
            </p>
          </div>

          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Item Description</th>
                <th style="width: 15%; text-align: center;">Qty</th>
                <th style="width: 17.5%; text-align: right;">Unit Price</th>
                <th style="width: 17.5%; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items && Array.isArray(order.items) && order.items.length > 0 ? order.items.map(item => `
                <tr>
                  <td>
                    <div class="item-name">${item.product_name || 'Product'}</div>
                    ${item.color_name || item.size_name ? `
                    <div class="item-details">
                      ${item.color_name ? `Color: ${item.color_name}` : ''}
                      ${item.color_name && item.size_name ? ' • ' : ''}
                      ${item.size_name ? `Size: ${item.size_name}` : ''}
                    </div>
                    ` : ''}
                  </td>
                  <td style="text-align: center;">${item.quantity || 0}</td>
                  <td style="text-align: right;">${tkIconSvg}${parseFloat(item.unit_price || 0).toFixed(2)}</td>
                  <td style="text-align: right;">${tkIconSvg}${(parseFloat(item.unit_price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                </tr>
              `).join('') : '<tr><td colspan="4" style="text-align: center; color: #9ca3af;">No items found</td></tr>'}
            </tbody>
          </table>

          <!-- Totals -->
          <div class="totals-section">
            <div class="total-row">
              <div class="total-label">TOTAL AMOUNT</div>
              <div class="total-amount">${tkIconSvg}${parseFloat(order.total_amount || 0).toFixed(2)}</div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p><strong>Thank you for your order!</strong></p>
            <p>For any queries regarding this invoice, please contact us at <strong>support@icommerce.com</strong></p>
            <p style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af;">
              Developed by <a href="https://www.exeyezone.com" target="_blank" style="color: #f43f5e; font-weight: 600; text-decoration: none;">exeyezone</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      console.error('Failed to open new window. Pop-up may be blocked.');
      alert('Please allow pop-ups for this site to generate invoices.');
      return;
    }
    
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    if (downloadPDF) {
      // Wait for content to load, then auto-download as PDF
      printWindow.onload = function() {
        printWindow.document.title = order.order_number;
        
        // Load html2pdf library dynamically
        const script = printWindow.document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = function() {
          try {
            const opt = {
              margin: 10,
              filename: `${order.order_number}.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, logging: false, useCORS: true },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            printWindow.html2pdf().set(opt).from(printWindow.document.body).save().then(() => {
              setTimeout(() => printWindow.close(), 1000);
            }).catch((err) => {
              console.error('PDF generation failed:', err);
              printWindow.close();
            });
          } catch (err) {
            console.error('Error generating PDF:', err);
            printWindow.close();
          }
        };
        script.onerror = function() {
          console.error('Failed to load html2pdf library');
          printWindow.close();
        };
        printWindow.document.head.appendChild(script);
      };
    } else {
      // For print button, wait for images to load then print
      printWindow.onload = function() {
        printWindow.document.title = order.order_number;
        setTimeout(() => {
          try {
            printWindow.print();
          } catch (err) {
            console.error('Print failed:', err);
          }
        }, 500);
      };
    }
  };

  // Order progress steps
  const statusSteps = [
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ];

  function OrderProgressTracker({ status }) {
    const currentIdx = statusSteps.indexOf(status);
    
    const stepIcons = {
      'PENDING': '📋',
      'PROCESSING': '⚡',
      'SHIPPED': '🚚',
      'DELIVERED': '📦',
      'CANCELLED': '❌',
    };
    
    return (
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm sm:text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-[var(--color-status-processing)] rounded-full animate-pulse flex-shrink-0"></div>
          <span>Order Progress</span>
        </h4>
        
        {/* Mobile: Vertical layout */}
        <div className="block sm:hidden space-y-3">
          {statusSteps.map((step, idx) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-all duration-300 flex-shrink-0 ${
                idx < currentIdx
                  ? 'bg-[var(--color-status-delivered)] border-[var(--color-status-delivered)] text-white shadow-lg'
                  : idx === currentIdx
                  ? 'bg-[var(--color-status-processing)] border-[var(--color-status-processing)] text-white shadow-md animate-pulse'
                  : 'bg-[var(--color-background)] border-border text-text-secondary'
              }`}>
                {idx <= currentIdx ? stepIcons[step] : step[0]}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-medium transition-colors duration-300 ${
                  idx <= currentIdx ? 'text-text-primary' : 'text-text-secondary'
                }`}>
                  {step}
                </div>
                {idx < statusSteps.length - 1 && (
                  <div className={`w-full h-1 rounded-full mt-2 transition-all duration-500 ${
                    idx < currentIdx
                      ? 'bg-[var(--color-status-delivered)] shadow-sm'
                      : idx === currentIdx - 1
                      ? 'bg-[var(--color-status-processing)] animate-pulse'
                      : 'bg-border'
                  }`} />
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop: Horizontal layout */}
        <div className="hidden sm:flex items-center gap-2 lg:gap-3">
          {statusSteps.map((step, idx) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-1 min-w-0">
                <div className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full text-xs lg:text-sm font-bold border-2 transition-all duration-300 ${
                  idx < currentIdx
                    ? 'bg-[var(--color-status-delivered)] border-[var(--color-status-delivered)] text-white shadow-lg scale-110'
                    : idx === currentIdx
                    ? 'bg-[var(--color-status-processing)] border-[var(--color-status-processing)] text-white shadow-md animate-pulse'
                    : 'bg-[var(--color-background)] border-border text-text-secondary hover:border-[var(--color-status-processing)]'
                }`}>
                  {idx <= currentIdx ? stepIcons[step] : step[0]}
                </div>
                <div className={`text-xs font-medium transition-colors duration-300 text-center px-1 ${
                  idx <= currentIdx ? 'text-text-primary' : 'text-text-secondary'
                }`}>
                  <span className="hidden lg:inline">{step}</span>
                  <span className="lg:hidden">{step.slice(0, 4)}</span>
                </div>
              </div>
              {idx < statusSteps.length - 1 && (
                <div className={`flex-1 h-1 rounded-full transition-all duration-500 min-w-[20px] ${
                  idx < currentIdx
                    ? 'bg-[var(--color-status-delivered)] shadow-sm'
                    : idx === currentIdx - 1
                    ? 'bg-[var(--color-status-processing)] animate-pulse'
                    : 'bg-border'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  function TrackingHistory({ updates }) {
    return (
      <motion.div
        className="space-y-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12 },
          },
        }}
      >
        {updates && updates.length > 0 ? (
          updates.map((update, idx) => (
            <motion.div
              key={idx}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <ListChecks className="text-accent mt-0.5 flex-shrink-0" size={16} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base text-text-primary">
                  {update.status}
                </div>
                <div className="text-xs sm:text-sm text-text-secondary mt-1">
                  {format(new Date(update.timestamp), 'PPpp')}
                </div>
                {update.notes && (
                  <div className="text-xs sm:text-sm text-text-secondary mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded border-l-2 border-accent/30">
                    {update.notes}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-text-secondary text-sm sm:text-base p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
            No tracking updates yet.
          </div>
        )}
      </motion.div>
    );
  }

  // Card for each order
  function OrderCard({ order }) {
    const [timeElapsed, setTimeElapsed] = useState('');

    useEffect(() => {
      const updateElapsed = () => {
        setTimeElapsed(formatDistanceToNow(new Date(order.ordered_at), { addSuffix: false }));
      };
      updateElapsed();
      const interval = setInterval(updateElapsed, 60000);
      return () => clearInterval(interval);
    }, [order.ordered_at]);

    const totalItems = order.items?.length || 0;
    const totalQuantity = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const modifiers = order.items ? new Set(order.items.map(item => item.product_name || item.product?.name)).size : 0;

    const getStatusBadgeColor = (status) => {
      const colors = {
        'PENDING': 'bg-yellow-500',
        'PROCESSING': 'bg-blue-500',
        'SHIPPED': 'bg-purple-500',
        'DELIVERED': 'bg-green-500',
        'CANCELLED': 'bg-red-500',
      };
      return colors[status] || 'bg-gray-500';
    };

    const handleTrackOrder = () => {
      setSelectedOrder(order);
      if (window.innerWidth < 768) {
        setIsMobileSidebarOpen(true);
      }
    };

    return (
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300"
        layout
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
              <FileText className="text-gray-600 dark:text-gray-300" size={20} />
            </div>
            <div>
              <p className="font-bold text-lg text-gray-800 dark:text-white">{order.order_number}</p>
              <span className={`text-xs font-semibold text-white px-2 py-1 rounded-full ${getStatusBadgeColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Order time</span>
            </div>
            <span className="font-medium text-gray-800 dark:text-white">{format(new Date(order.ordered_at), 'd MMM, yy • h:mm a')}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Time elapsed</span>
            </div>
            <span className="font-medium text-gray-800 dark:text-white">{timeElapsed}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>Location</span>
            </div>
            <span className="font-medium text-gray-800 dark:text-white">{order.shipping_address?.city || 'N/A'}</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
              <p className="font-bold text-lg text-gray-800 dark:text-white">{totalItems}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Qty</p>
              <p className="font-bold text-lg text-gray-800 dark:text-white">{totalQuantity}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Modifiers</p>
              <p className="font-bold text-lg text-gray-800 dark:text-white">{modifiers}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
           <button
            className="flex items-center justify-center gap-2 bg-[var(--color-button-primary)] hover:opacity-90 text-white px-4 py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 text-sm font-medium group"
            onClick={handleTrackOrder}
          >
            <Truck size={16} className="group-hover:animate-bounce" />
            <span>Track Order</span>
          </button>
          {order.tracking_number && (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              Tracking ID: <span className="font-mono text-gray-700 dark:text-gray-300">{order.tracking_number}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-text-primary py-8 px-2">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center shadow-lg">
            <div className="mb-6">
              <div className="w-16 h-16 bg-[var(--color-button-primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="text-[var(--color-button-primary)]" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Login Required</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">Please log in to view your orders</p>
            </div>
            <button
              onClick={() => openAuthModal('login')}
              className="bg-[var(--color-button-primary)] hover:opacity-90 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
            >
              Login to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <OrderPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-text-primary py-8 px-2">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center shadow-lg">
            <div className="mb-6">
              <div className="w-16 h-16 bg-[var(--color-status-cancelled)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <X className="text-[var(--color-status-cancelled)]" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-red-600 dark:text-red-400">Error Loading Orders</h2>
              <p className="text-red-600 dark:text-red-300 text-lg mb-6">{error}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                className="bg-[var(--color-status-cancelled)] hover:opacity-90 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
                onClick={() => {
                  setError(null);
                  if (isAuthenticated && user?.id) {
                    setIsLoading(true);
                    getUserOrders(user.id).then(data => {
                      if (data && data.error) {
                        setError(data.error);
                      } else if (Array.isArray(data)) {
                        setOrders(data);
                      }
                      setIsLoading(false);
                    }).catch(err => {
                      setError(err.message || 'Failed to load orders');
                      setIsLoading(false);
                    });
                  }
                }}
              >
                Try Again
              </button>
              {error.includes('Authentication') && (
                <button
                  className="bg-[var(--color-button-primary)] hover:opacity-90 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
                  onClick={() => openAuthModal('login')}
                >
                  Login Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getFilteredOrders = () => {
    if (!Array.isArray(orders)) return [];
    
    if (activeFilter === 'All') {
      return orders;
    }
    
    const filterMap = {
      'Active': ['PENDING', 'PROCESSING'],
      'New': ['PENDING'],
      'Preparing': ['PROCESSING'],
      'Pickup': ['SHIPPED'],
      'Delivery': ['SHIPPED'],
      'Done': ['DELIVERED'],
    };
    
    const statuses = filterMap[activeFilter];
    if (statuses) {
      return orders.filter(order => statuses.includes(order.status));
    }
    
    return orders.filter(order => order.status === activeFilter.toUpperCase());
  };

  const filteredOrders = getFilteredOrders();
  const currentOrders = filteredOrders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING');
  const previousOrders = filteredOrders.filter((o) =>
    o.status === 'SHIPPED' ||
    o.status === 'DELIVERED' ||
    o.status === 'CANCELLED'
  );

  // Filter bar component
  const FilterBar = () => {
    const filters = ['All', 'Active', 'New', 'Preparing', 'Pickup', 'Delivery', 'Done'];
    
    const getFilterCount = (filter) => {
      if (filter === 'All') return orders.length;
      
      const filterMap = {
        'Active': ['PENDING', 'PROCESSING'],
        'New': ['PENDING'],
        'Preparing': ['PROCESSING'],
        'Pickup': ['SHIPPED'],
        'Delivery': ['SHIPPED'],
        'Done': ['DELIVERED'],
      };
      
      const statuses = filterMap[filter];
      if (statuses) {
        return orders.filter(order => statuses.includes(order.status)).length;
      }
      
      return orders.filter(order => order.status === filter.toUpperCase()).length;
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 sticky top-0 z-10"
      >
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              const count = getFilterCount(filter);
              
              return (
                <motion.button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`relative px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'bg-[var(--color-button-primary)] text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {filter}
                    {count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {count}
                      </span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  // Order Details Panel Component
  const OrderDetailsPanel = ({ order, onClose, onDownloadInvoice }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-[var(--color-button-primary)] text-white p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">{order.order_number}</h3>
              <p className="text-sm opacity-90">{format(new Date(order.ordered_at), 'PPP')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-semibold">
            {order.status_display || order.status}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => generateInvoice(order, false)}
              className="flex items-center gap-2 bg-white text-[var(--color-button-primary)] px-3 py-2 rounded-lg font-medium hover:bg-white/90 transition-all shadow-md text-sm"
              title="Print Invoice"
            >
              <Download size={16} />
              Print
            </button>
            <button
              onClick={() => generateInvoice(order, true)}
              className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg font-medium hover:bg-green-600 transition-all shadow-md text-sm"
              title="Download as PDF"
            >
              <FileText size={16} />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 overflow-y-auto flex-1 space-y-6">
        {/* Order Progress */}
        <OrderProgressTracker status={order.status} />

        {/* Customer Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
        >
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Phone size={18} className="text-[var(--color-button-primary)]" />
            Customer Information
          </h4>
          <div className="space-y-2 text-sm">
            {order.customer_name && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="font-medium text-gray-800 dark:text-white">{order.customer_name}</span>
              </div>
            )}
            {order.customer_email && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="font-medium text-gray-800 dark:text-white">{order.customer_email}</span>
              </div>
            )}
            {order.customer_phone && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                <span className="font-medium text-gray-800 dark:text-white">{order.customer_phone}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Order Details - Compact Format */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-3 border-t border-b border-gray-200 dark:border-gray-700"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-1">
            <p>
              {order.payment && (
                <>
                  <span className="font-semibold text-gray-800 dark:text-white">Payment:</span>{' '}
                  {order.payment.payment_method_display || order.payment.payment_method}
                  {order.payment.payment_method !== 'cod' && order.payment.payment_method_display !== 'Cash on Delivery' && (
                    <>
                      {order.payment.admin_account_number && ` (Admin: ${order.payment.admin_account_number})`}
                      {order.payment.sender_number && ` • Sender: ${order.payment.sender_number}`}
                      {order.payment.transaction_id && ` • TxID: ${order.payment.transaction_id}`}
                    </>
                  )}
                </>
              )}
              {order.shipping_method_name && (
                <>
                  {' • '}
                  <span className="font-semibold text-gray-800 dark:text-white">Shipping:</span>{' '}
                  {order.shipping_method_name}
                </>
              )}
            </p>
            <p>
              {order.cash_on_delivery?.delivery_status && (
                <>
                  <span className="font-semibold text-gray-800 dark:text-white">Delivery:</span>{' '}
                  {order.cash_on_delivery.delivery_status_display || order.cash_on_delivery.delivery_status}
                  {order.cash_on_delivery.scheduled_delivery_date && ` (${format(new Date(order.cash_on_delivery.scheduled_delivery_date), 'PP')})`}
                </>
              )}
              {order.cash_on_delivery?.amount_to_collect && (
                <>
                  {' • '}
                  <span className="font-semibold text-gray-800 dark:text-white">Collect:</span>{' '}
                  <Tk_icon size={12} className="inline" />
                  {parseFloat(order.cash_on_delivery.amount_to_collect || 0).toFixed(2)}
                </>
              )}
              {order.payment && (order.payment.payment_method === 'cod' || order.payment.payment_method_display === 'Cash on Delivery') && (
                <>
                  {' • '}
                  <span className="font-semibold text-gray-800 dark:text-white">Delivery Team:</span>{' '}
                  {order.cash_on_delivery?.delivery_person_name 
                    ? `${order.cash_on_delivery.delivery_person_name}${order.cash_on_delivery.delivery_person_phone ? ` (${order.cash_on_delivery.delivery_person_phone})` : ''}`
                    : 'Not Declared'
                  }
                </>
              )}
            </p>
          </div>
        </motion.div>

        {/* Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Package size={18} className="text-[var(--color-button-primary)]" />
            Order Items
          </h4>
          <div className="space-y-3">
            {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
              order.items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                {item.product_image && (
                  <div className="relative w-16 h-16 rounded border border-gray-200 dark:border-gray-600 bg-white flex-shrink-0 overflow-hidden">
                    <Image
                      src={item.product_image}
                      alt={item.product_name || 'Product'}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-white">{item.product_name || 'Product'}</p>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-0.5">
                    <p>Qty: {item.quantity || 0}</p>
                    {item.color_name && <p>Color: {item.color_name}</p>}
                    {item.size_name && <p>Size: {item.size_name}</p>}
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-800 dark:text-white flex-shrink-0">
                  <Tk_icon size={14} className="inline mr-1" />
                  {parseFloat(item.unit_price || 0).toFixed(2)}
                </div>
              </motion.div>
            ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                No items found
              </div>
            )}
          </div>
        </motion.div>

        {/* Total */}
        {order.total_amount && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--color-button-primary)] text-white p-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Order Total:</span>
              <span className="font-bold text-xl">
                <Tk_icon size={16} className="inline mr-1" />
                {parseFloat(order.total_amount || 0).toFixed(2)}
              </span>
            </div>
          </motion.div>
        )}

        {/* Special Instructions */}
        {(order.special_instructions || order.cod_details?.special_instructions) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
          >
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <FileText size={18} />
              Special Instructions
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {order.special_instructions || order.cod_details?.special_instructions}
            </p>
          </motion.div>
        )}

        {/* Tracking History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <ListChecks size={18} className="text-[var(--color-button-primary)]" />
            Tracking History
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <TrackingHistory updates={order.updates || []} />
          </div>
        </motion.div>

        {/* Developer Credit */}
        <div className="text-center text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
          Developed by{' '}
          <a 
            href="https://www.exeyezone.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold text-rose-500 hover:underline"
          >
            exeyezone
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[var(--color-background)] text-text-primary py-6 min-h-screen">
      {/* Filter Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 mb-6">
        <FilterBar />
      </div>

      {/* Main Content */}
      {selectedOrder ? (
        // Grid Layout when order is selected
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Order Cards - Show only 2 cards on desktop */}
            <div className={`space-y-6 ${isMobileSidebarOpen ? 'hidden md:block' : 'block'}`}>
              {activeFilter === 'All' ? (
                <>
                  {currentOrders.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Truck size={20} className="text-[var(--color-button-primary)]" />
                        Current Orders
                        <span className="bg-[var(--color-status-processing)] text-white text-xs px-2 py-1 rounded-full">
                          {currentOrders.length}
                        </span>
                      </h2>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <AnimatePresence mode="popLayout">
                          {currentOrders.map((order) => (
                            <OrderCard key={order.order_number} order={order} />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                  {previousOrders.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 mt-6">
                        <Package size={20} className="text-[var(--color-button-primary)]" />
                        Order History
                        <span className="bg-[var(--color-status-delivered)] text-white text-xs px-2 py-1 rounded-full">
                          {previousOrders.length}
                        </span>
                      </h2>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <AnimatePresence mode="popLayout">
                          {previousOrders.map((order) => (
                            <OrderCard key={order.order_number} order={order} />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Package size={20} className="text-[var(--color-button-primary)]" />
                    {activeFilter} Orders
                    {filteredOrders.length > 0 && (
                      <span className="bg-[var(--color-button-primary)] text-white text-xs px-2 py-1 rounded-full">
                        {filteredOrders.length}
                      </span>
                    )}
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                      {filteredOrders.map((order) => (
                        <OrderCard key={order.order_number} order={order} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Order Details (Desktop) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="hidden md:block sticky top-4 h-[calc(100vh-8rem)]"
            >
              <OrderDetailsPanel
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onDownloadInvoice={() => generateInvoice(selectedOrder)}
              />
            </motion.div>
          </div>

          {/* Mobile Sidebar */}
          <AnimatePresence>
            {isMobileSidebarOpen && (
              <motion.div
                className="md:hidden fixed inset-0 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Backdrop */}
                <motion.div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    setSelectedOrder(null);
                  }}
                />
                
                {/* Sidebar */}
                <motion.div
                  className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl overflow-hidden"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                  <OrderDetailsPanel
                    order={selectedOrder}
                    onClose={() => {
                      setIsMobileSidebarOpen(false);
                      setSelectedOrder(null);
                    }}
                    onDownloadInvoice={() => generateInvoice(selectedOrder)}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        // Regular Grid View when no order is selected
        <div className="w-full max-w-7xl mx-auto px-4">
          {activeFilter === 'All' ? (
            <>
              {/* Current Orders */}
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="p-2 bg-[var(--color-button-primary)]/10 rounded-xl">
                    <Truck size={24} className="text-[var(--color-button-primary)]" />
                  </div>
                  Current Orders
                  {currentOrders.length > 0 && (
                    <span className="bg-[var(--color-status-processing)] text-white text-sm px-3 py-1 rounded-full shadow-lg">
                      {currentOrders.length}
                    </span>
                  )}
                </h2>
                {currentOrders.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center shadow-lg">
                    <div className="p-4 bg-[var(--color-button-primary)]/10 rounded-2xl inline-block mb-4">
                      <Truck className="text-[var(--color-button-primary)]" size={48} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No current orders</h3>
                    <p className="text-gray-600 dark:text-gray-400">You don't have any orders being processed or pending at the moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                      {currentOrders.map((order) => (
                        <OrderCard key={order.order_number} order={order} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Previous Orders */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="p-2 bg-[var(--color-status-delivered)]/10 rounded-xl">
                    <Package size={24} className="text-[var(--color-status-delivered)]" />
                  </div>
                  Order History
                  {previousOrders.length > 0 && (
                    <span className="bg-[var(--color-status-delivered)] text-white text-sm px-3 py-1 rounded-full shadow-lg">
                      {previousOrders.length}
                    </span>
                  )}
                </h2>
                {previousOrders.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center shadow-lg">
                    <div className="p-4 bg-[var(--color-status-delivered)]/10 rounded-2xl inline-block mb-4">
                      <Package className="text-[var(--color-status-delivered)]" size={48} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No order history</h3>
                    <p className="text-gray-600 dark:text-gray-400">Your previous orders will appear here once you complete some purchases.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                      {previousOrders.map((order) => (
                        <OrderCard key={order.order_number} order={order} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Filtered Orders */
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="p-2 bg-[var(--color-button-primary)]/10 rounded-xl">
                  <Package size={24} className="text-[var(--color-button-primary)]" />
                </div>
                {activeFilter} Orders
                {filteredOrders.length > 0 && (
                  <span className="bg-[var(--color-button-primary)] text-white text-sm px-3 py-1 rounded-full shadow-lg">
                    {filteredOrders.length}
                  </span>
                )}
              </h2>
              {filteredOrders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center shadow-lg"
                >
                  <div className="p-4 bg-[var(--color-button-primary)]/10 rounded-2xl inline-block mb-4">
                    <Package className="text-[var(--color-button-primary)]" size={48} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No {activeFilter.toLowerCase()} orders</h3>
                  <p className="text-gray-600 dark:text-gray-400">You don't have any orders in this category.</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.map((order) => (
                      <OrderCard key={order.order_number} order={order} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
