import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const ContactPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
        <p className="text-lg text-gray-700 text-center max-w-2xl mx-auto">
          Have questions or need support? Reach out to us!
        </p>
        <div className="mt-8 text-center">
          <p className="text-gray-700">Email: support@sitebango.com</p>
          <p className="text-gray-700">Phone: +1 (555) 123-4567</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;