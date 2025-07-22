import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
        <div className="prose mx-auto">
          <p>Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.</p>
          <h2>Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, fill out a form, or communicate with us.</p>
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, as well as to communicate with you.</p>
          <h2>Sharing Your Information</h2>
          <p>We do not share your personal information with third parties except as described in this policy or with your consent.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;