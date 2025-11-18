// app/terms-and-conditions/page.js
export const metadata = {
  title: 'Terms and Conditions | iCommerce - Multivendor E-commerce Platform',
  description: 'Read the terms and conditions for using iCommerce, a multivendor e-commerce platform connecting buyers and sellers across Bangladesh.',
  keywords: 'terms and conditions, user agreement, seller agreement, buyer policy, e-commerce terms',
  openGraph: {
    title: 'Terms and Conditions | iCommerce',
    description: 'Terms and conditions for using our multivendor e-commerce platform',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Terms and Conditions
          </h1>
          <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full mb-4 sm:mb-6"></div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
            Please read these terms and conditions carefully before using our multivendor e-commerce platform
          </p>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-3 sm:mt-4">
            Last Updated: October 22, 2025
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 space-y-6 sm:space-y-8 lg:space-y-10">
          
          {/* 1. Introduction */}
          <section className="border-b border-gray-200 dark:border-gray-700 pb-6 sm:pb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold mr-3 sm:mr-4 flex-shrink-0">1</span>
              Introduction
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                Welcome to <span className="font-semibold text-blue-600 dark:text-blue-400">iCommerce</span>, a multivendor e-commerce platform operated in Bangladesh. These Terms and Conditions govern your use of our website, mobile application, and services.
              </p>
              <p>
                By accessing or using our platform, you agree to be bound by these terms. If you disagree with any part of these terms, you may not access our service.
              </p>
              <p>
                Our platform connects multiple independent vendors (sellers) with buyers, facilitating transactions between them. We act as an intermediary platform and marketplace.
              </p>
            </div>
          </section>

          {/* 2. Definitions */}
          <section className="border-b border-gray-200 dark:border-gray-700 pb-6 sm:pb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold mr-3 sm:mr-4 flex-shrink-0">2</span>
              Definitions
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 sm:p-5">
                <ul className="space-y-2 sm:space-y-3 text-gray-700 dark:text-gray-300">
                  <li className="flex flex-col sm:flex-row sm:items-start">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 min-w-[100px] sm:min-w-[140px] mb-1 sm:mb-0">"Platform":</span>
                    <span className="flex-1">Refers to the iCommerce website, mobile application, and all associated services</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-start">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 min-w-[100px] sm:min-w-[140px] mb-1 sm:mb-0">"Vendor/Seller":</span>
                    <span className="flex-1">Independent business entities or individuals who list and sell products on our platform</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-start">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 min-w-[100px] sm:min-w-[140px] mb-1 sm:mb-0">"Buyer/User":</span>
                    <span className="flex-1">Individuals or entities who browse and purchase products from vendors on our platform</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-start">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 min-w-[100px] sm:min-w-[140px] mb-1 sm:mb-0">"Products":</span>
                    <span className="flex-1">Goods, merchandise, or services listed for sale by vendors on the platform</span>
                  </li>
                  <li className="flex flex-col sm:flex-row sm:items-start">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 min-w-[100px] sm:min-w-[140px] mb-1 sm:mb-0">"Transaction":</span>
                    <span className="flex-1">The complete process of purchase from order placement to delivery and payment settlement</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. User Registration and Account */}
          <section className="border-b border-gray-200 dark:border-gray-700 pb-6 sm:pb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold mr-3 sm:mr-4 flex-shrink-0">3</span>
              User Registration and Account
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">3.1 Registration Requirements</h3>
                <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                  <li>You must be at least 18 years old to create an account</li>
                  <li>You must provide accurate, current, and complete information</li>
                  <li>You must maintain and update your account information</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">3.2 Account Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Buyer Account</h4>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">For customers purchasing products from vendors</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">Vendor Account</h4>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">For sellers listing and managing products on the platform</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">3.3 Account Security</h3>
                <p>You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use or security breach.</p>
              </div>
            </div>
          </section>

          {/* 4. Vendor Terms */}
          <section className="border-b border-gray-200 dark:border-gray-700 pb-6 sm:pb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold mr-3 sm:mr-4 flex-shrink-0">4</span>
              Vendor Terms
            </h2>
            <div className="space-y-4 sm:space-y-5 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">4.1 Vendor Responsibilities</h3>
                <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                  <li>Provide accurate product descriptions, images, and pricing</li>
                  <li>Maintain adequate inventory of listed products</li>
                  <li>Process orders promptly and ship within promised timeframes</li>
                  <li>Provide excellent customer service and respond to buyer inquiries</li>
                  <li>Handle returns and refunds according to platform policies</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Pay all applicable fees, commissions, and taxes</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">4.2 Prohibited Products</h3>
                <p className="mb-2 sm:mb-3">Vendors may not list or sell:</p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                  <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <li>Illegal, counterfeit, or stolen products</li>
                    <li>Products that infringe intellectual property rights</li>
                    <li>Hazardous materials or weapons</li>
                    <li>Tobacco, alcohol, or controlled substances (unless licensed)</li>
                    <li>Adult content or explicit materials</li>
                    <li>Products that violate Bangladesh laws and regulations</li>
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">4.3 Commission and Fees</h3>
                <p>Vendors agree to pay platform commission on each successful transaction. Commission rates vary by category and will be clearly communicated. Payment processing fees may also apply.</p>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">4.4 Performance Standards</h3>
                <p>Vendors must maintain minimum performance standards including order fulfillment rate, response time, and customer satisfaction ratings. Failure to meet standards may result in account suspension.</p>
              </div>
            </div>
          </section>

          {/* 5. Buyer Terms */}
          <section className="border-b border-gray-200 dark:border-gray-700 pb-6 sm:pb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold mr-3 sm:mr-4 flex-shrink-0">5</span>
              Buyer Terms
            </h2>
            <div className="space-y-4 sm:space-y-5 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">5.1 Order and Payment</h3>
                <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 sm:ml-4">
                  <li>All orders are subject to acceptance by the vendor</li>
                  <li>Prices are as displayed at the time of order placement</li>
                  <li>Payment must be made through authorized payment methods</li>
                  <li>You are responsible for providing accurate delivery information</li>
                  <li>Additional charges may apply for shipping and taxes</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">5.2 Product Information</h3>
                <p>While we strive for accuracy, product information is provided by vendors. We do not guarantee the accuracy of product descriptions, pricing, or availability. Contact vendors directly for clarification.</p>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">5.3 Delivery</h3>
                <p>Delivery times are estimates provided by vendors. We are not responsible for delays caused by vendors, shipping carriers, or circumstances beyond our control. Track your order through your account.</p>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">5.4 Returns and Refunds</h3>
                <p>Return and refund policies are set by individual vendors within our platform guidelines. Review the vendor's policy before purchase. Claims must be made within specified timeframes.</p>
              </div>
            </div>
          </section>

          {/* 6. Payment Terms */}
          <section className="border-b border-gray-200 dark:border-gray-700 pb-6 sm:pb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold mr-3 sm:mr-4 flex-shrink-0">6</span>
              Payment Terms
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">6.1 Payment Processing</h3>
                <p>We use secure third-party payment processors. By making a payment, you agree to the terms of our payment partners. We do not store complete credit card information.</p>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">6.2 Payment Methods</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center text-xs sm:text-sm font-medium">Credit Card</div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center text-xs sm:text-sm font-medium">Debit Card</div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center text-xs sm:text-sm font-medium">Mobile Banking</div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center text-xs sm:text-sm font-medium">Cash on Delivery</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">6.3 Vendor Payments</h3>
                <p>Vendors receive payment after successful delivery and completion of any applicable return period. We reserve the right to hold payments pending investigation of disputes or suspected fraud.</p>
              </div>
            </div>
          </section>

          {/* 7. Intellectual Property */}
          <section className="border-b border-gray-200 dark:border-gray-700 pb-6 sm:pb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold mr-3 sm:mr-4 flex-shrink-0">7</span>
              Intellectual Property
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                All platform content including logos, design, text, graphics, software, and functionality are owned by iCommerce or our licensors and are protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                Vendors retain ownership of their product listings but grant us a license to display, promote, and distribute their content on our platform. Vendors must have rights to all content they upload.
              </p>
              <p>
                Users may not reproduce, distribute, modify, or create derivative works from platform content without explicit written permission.
              </p>
            </div>
          </section>

          {/* 8. Privacy and Data Protection */}
          <section className="border-b border-gray-200 dark:border-gray-700 pb-6 sm:pb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold mr-3 sm:mr-4 flex-shrink-0">8</span>
              Privacy and Data Protection
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                We collect, use, and protect your personal data as described in our Privacy Policy. By using our platform, you consent to our data practices.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-5">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Data We Collect:</h4>
                <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 ml-2">
                  <li>Personal identification information</li>
                  <li>Contact details and delivery addresses</li>
                  <li>Payment and transaction information</li>
                  <li>Browsing behavior and preferences</li>
                  <li>Communication with vendors and support</li>
                </ul>
              </div>
              <p>
                We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
              </p>
            </div>
          </section>

          {/* 9. Dispute Resolution */}
          <section className="border-b border-gray-200 dark:border-gray-700 pb-6 sm:pb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold mr-3 sm:mr-4 flex-shrink-0">9</span>
              Dispute Resolution
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">9.1 Buyer-Vendor Disputes</h3>
                <p>We provide a dispute resolution process for conflicts between buyers and vendors. Contact our support team to initiate a dispute within 30 days of the transaction.</p>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">9.2 Mediation</h3>
                <p>We will attempt to mediate disputes fairly. Our decision in mediation is final and binding. We reserve the right to make final decisions on disputes.</p>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">9.3 Governing Law</h3>
                <p>These terms are governed by the laws of Bangladesh. Any legal action must be brought in the courts of Dhaka, Bangladesh.</p>
              </div>
            </div>
          </section>

          {/* 10. Liability and Disclaimers */}
          <section className="border-b border-gray-200 dark:border-gray-700 pb-6 sm:pb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold mr-3 sm:mr-4 flex-shrink-0">10</span>
              Liability and Disclaimers
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 sm:p-5">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2 sm:mb-3">Platform Disclaimer:</h4>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  The platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access, error-free operation, or that the platform meets your requirements.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">10.1 Limitation of Liability</h3>
                <p>
                  We are not liable for indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability is limited to the amount you paid us in the past 12 months.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">10.2 Vendor Liability</h3>
                <p>
                  Vendors are independent businesses. We are not responsible for vendor actions, product quality, fulfillment, or customer service. Disputes are primarily between buyers and vendors.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">10.3 Third-Party Services</h3>
                <p>
                  We use third-party services for payment processing, shipping, and other functions. We are not responsible for failures or issues with third-party services.
                </p>
              </div>
            </div>
          </section>

          {/* 11. Prohibited Conduct */}
          <section className="border-b border-gray-200 dark:border-gray-700 pb-6 sm:pb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold mr-3 sm:mr-4 flex-shrink-0">11</span>
              Prohibited Conduct
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>Users must not engage in any of the following prohibited activities:</p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-5">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <li className="flex items-start">
                    <span className="text-red-600 dark:text-red-400 mr-2 flex-shrink-0">✗</span>
                    <span>Fraudulent or illegal activities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 dark:text-red-400 mr-2 flex-shrink-0">✗</span>
                    <span>Harassment or abusive behavior</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 dark:text-red-400 mr-2 flex-shrink-0">✗</span>
                    <span>Spam or unsolicited marketing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 dark:text-red-400 mr-2 flex-shrink-0">✗</span>
                    <span>Hacking or unauthorized access</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 dark:text-red-400 mr-2 flex-shrink-0">✗</span>
                    <span>Spreading malware or viruses</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 dark:text-red-400 mr-2 flex-shrink-0">✗</span>
                    <span>Manipulating reviews or ratings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 dark:text-red-400 mr-2 flex-shrink-0">✗</span>
                    <span>Circumventing security measures</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 dark:text-red-400 mr-2 flex-shrink-0">✗</span>
                    <span>Scraping or data mining</span>
                  </li>
                </ul>
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Violation of these terms may result in immediate account suspension or termination.
              </p>
            </div>
          </section>

          {/* 12. Account Suspension and Termination */}
          <section className="border-b border-gray-200 dark:border-gray-700 pb-6 sm:pb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold mr-3 sm:mr-4 flex-shrink-0">12</span>
              Account Suspension and Termination
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                We reserve the right to suspend or terminate your account at our discretion if you violate these terms, engage in fraudulent activity, or pose a risk to other users.
              </p>
              <p>
                You may close your account at any time. Upon termination, you must cease all use of the platform. Provisions regarding liability, indemnification, and dispute resolution survive termination.
              </p>
              <p>
                Suspended or terminated accounts may forfeit access to pending orders, balances, and account data. We will attempt to facilitate order completion where reasonable.
              </p>
            </div>
          </section>

          {/* 13. Changes to Terms */}
          <section className="border-b border-gray-200 dark:border-gray-700 pb-6 sm:pb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold mr-3 sm:mr-4 flex-shrink-0">13</span>
              Changes to Terms
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                We may update these terms from time to time. We will notify users of significant changes via email or platform notification. Your continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
              <p>
                It is your responsibility to review these terms periodically. The "Last Updated" date at the top indicates the most recent revision.
              </p>
            </div>
          </section>

          {/* 14. Contact Information */}
          <section>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold mr-3 sm:mr-4 flex-shrink-0">14</span>
              Contact Information
            </h2>
            <div className="space-y-4 sm:space-y-5">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                If you have questions about these Terms and Conditions, please contact us:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 sm:p-5 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">Customer Support</h4>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <p className="flex items-center flex-wrap">
                      <span className="font-medium mr-2">Email:</span>
                      <a href="mailto:support@icommerce.com" className="text-blue-600 dark:text-blue-400 hover:underline">support@icommerce.com</a>
                    </p>
                    <p className="flex items-center flex-wrap">
                      <span className="font-medium mr-2">Phone:</span>
                      <span>+880 1234-567890</span>
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 sm:p-5 border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm sm:text-base">Business Address</h4>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <p>iCommerce Limited</p>
                    <p>Dhaka, Bangladesh</p>
                    <p>Business Hours: 9 AM - 6 PM (GMT+6)</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Note */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              By using iCommerce, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 sm:mt-3">
              Thank you for being part of our multivendor e-commerce community!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
