import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const IndustriesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-center mb-8">Industries We Serve</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Restaurants</h2>
            <p className="text-gray-600">Showcase your menu, take reservations, and attract food lovers.</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Salons & Spas</h2>
            <p className="text-gray-600">Highlight your services, book appointments, and display your portfolio.</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Contractors</h2>
            <p className="text-gray-600">Generate leads, showcase projects, and build trust with potential clients.</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Real Estate</h2>
            <p className="text-gray-600">List properties, connect with buyers/sellers, and establish your expertise.</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Fitness & Wellness</h2>
            <p className="text-gray-600">Promote classes, manage memberships, and inspire healthy lifestyles.</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Professional Services</h2>
            <p className="text-gray-600">Attract new clients, highlight your services, and build your brand.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IndustriesPage;