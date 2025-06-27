import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const PricingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-center mb-8">Pricing</h1>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Basic</h2>
            <p className="text-4xl font-extrabold mb-6">$29<span className="text-lg font-normal">/month</span></p>
            <ul className="text-gray-600 space-y-2 mb-8">
              <li>1 Website</li>
              <li>Basic SEO</li>
              <li>Email Support</li>
            </ul>
            <button className="btn-primary text-white font-bold py-3 px-6 rounded-lg">Get Started</button>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center border-2 border-[#6914c1]">
            <h2 className="text-2xl font-bold mb-4 text-[#6914c1]">Pro</h2>
            <p className="text-4xl font-extrabold mb-6">$59<span className="text-lg font-normal">/month</span></p>
            <ul className="text-gray-600 space-y-2 mb-8">
              <li>5 Websites</li>
              <li>Advanced SEO</li>
              <li>CRM Integration</li>
              <li>Priority Support</li>
            </ul>
            <button className="btn-primary text-white font-bold py-3 px-6 rounded-lg">Get Started</button>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Enterprise</h2>
            <p className="text-4xl font-extrabold mb-6">$99<span className="text-lg font-normal">/month</span></p>
            <ul className="text-gray-600 space-y-2 mb-8">
              <li>Unlimited Websites</li>
              <li>Custom Features</li>
              <li>Dedicated Account Manager</li>
            </ul>
            <button className="btn-primary text-white font-bold py-3 px-6 rounded-lg">Contact Us</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;