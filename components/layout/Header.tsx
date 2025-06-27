import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
                <Image 
                    src="/sitebango-logo.svg" 
                    alt="Sitebango" 
                    width={140} 
                    height={35}
                    className="h-8 w-auto"
                />
            </div>
            <nav className="hidden md:flex items-center space-x-8 font-medium">
                <a href="#how" className="text-gray-600 hover:text-[#6914c1] transition-colors">How It Works</a>
                <a href="#features" className="text-gray-600 hover:text-[#6914c1] transition-colors">Features</a>
                <Link href="/industries" className="text-gray-600 hover:text-[#6914c1] transition-colors">Industries</Link>
                <Link href="/pricing" className="text-gray-600 hover:text-[#6914c1] transition-colors">Pricing</Link>
                <Link href="/signin" className="text-gray-600 hover:text-[#6914c1] transition-colors">Sign In</Link>
            </nav>
            <Link href="/signup" className="btn-primary text-white font-semibold py-2 px-5 rounded-lg">Get Started</Link>
        </div>
    </header>
);

export default Header;