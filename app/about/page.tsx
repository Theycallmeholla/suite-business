import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-center mb-8">About Us</h1>
        <p className="text-lg text-gray-700 text-center max-w-2xl mx-auto">
          Sitebango is dedicated to empowering local businesses with cutting-edge web solutions.
          We believe every business deserves a powerful online presence without the hassle.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;