import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => (
    <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
                <div>
                    <div className="mb-4">
                        <Image 
                            src="/sitebango-logo.svg" 
                            alt="Sitebango" 
                            width={140} 
                            height={35}
                            className="h-8 w-auto"
                        />
                    </div>
                    <p className="text-gray-600">
                        The complete platform for service business growth.
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold mb-4">Product</h4>
                    <ul className="space-y-2 text-gray-600">
                        <li><Link href="/features">Features</Link></li>
                        <li><Link href="/pricing">Pricing</Link></li>
                        <li><Link href="/industries">Industries</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-4">Company</h4>
                    <ul className="space-y-2 text-gray-600">
                        <li><Link href="/about">About</Link></li>
                        <li><Link href="/contact">Contact</Link></li>
                        <li><Link href="/privacy">Privacy</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-4">Get Started</h4>
                    <Link href="/signup" className="btn-primary text-white font-bold py-2 px-4 rounded-lg block text-center">
                        Start Free Trial
                    </Link>
                </div>
            </div>
            <div className="mt-12 pt-8 border-t text-center text-gray-500">
                <p>&copy; 2024 Sitebango. All rights reserved.</p>
            </div>
        </div>
    </footer>
);

export default Footer;