'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';

// COMPONENTS
const FloatingIcon = React.memo(({ children, className, delay }: { children: React.ReactNode; className: string; delay: string }) => (
    <div className={`floating-icon ${className} animation-delay-${delay}`}>
        {children}
    </div>
));

const HeroSection = React.memo(() => (
    <section className="py-24 md:py-40 relative overflow-hidden bg-gray-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
        
        <div className="container mx-auto px-6 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left side - Content */}
                <div className="text-left">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-gray-900 animate-fade-in-up-0">
                        Your Business Website,
                        <br />
                        <span className="bg-gradient-to-r from-[#6914c1] to-purple-500 text-transparent bg-clip-text">Done For You.</span>
                    </h1>
                    <p className="text-gray-500 text-lg md:text-xl max-w-lg mb-8 font-normal animate-fade-in-up-300">
                        We pull your Google Business data to instantly create a beautiful, SEO-optimized website. Comes complete with a CRM, lead management, and email & text marketing tools.
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 animate-fade-in-up-600">
                        <Link href="/signup" className="btn-primary text-white font-bold py-4 px-8 rounded-lg text-lg">Start Free Trial</Link>
                        <a href="#how" className="font-semibold py-4 px-8 rounded-lg text-lg text-gray-700 bg-white border border-gray-200 hover:border-gray-300 transition">Learn More &rarr;</a>
                    </div>
                    <p className="text-sm text-gray-500 animate-fade-in-up-900">
                        No credit card required • Setup in 10 minutes • Cancel anytime
                    </p>
                </div>

                {/* Right side - Hero Image */}
                <div className="flex justify-center animate-fade-in-up-400">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-md w-full">
                        <Image 
                            src="/hoop-dreams.jpg" 
                            alt="Business Success" 
                            width={500} 
                            height={300}
                            className="w-full h-auto object-cover"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </div>
    </section>
));

const StepCard = React.memo(({ number, title, description, children, delay }: { number: string; title: string; description: string; children: React.ReactNode; delay: string }) => (
    <div className={`card-glow bg-gray-900 text-white p-8 rounded-2xl card-anim animation-delay-${delay}`}>
        <div className="text-5xl font-black text-white mb-4">{number}</div>
        <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
        <p className="text-gray-100 mb-6 font-normal">{description}</p>
        {children}
    </div>
));

const HowItWorksSection = React.memo(() => (
    <section id="how" className="py-20 bg-white">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Go From <span className="text-[#6914c1]">Idea to Live</span> in 3 Steps</h2>
                <p className="max-w-xl mx-auto text-gray-500 mt-4 text-lg font-normal">Our AI-powered platform automates the entire process, so you can focus on your business.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <StepCard number="01" title="Connect Your Profile" description="Securely link your Google Business Profile. Our AI instantly imports your business info, photos, reviews, and services to build a solid foundation." delay="0.2s">
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                       <div className="flex items-center">
                           <img src="https://placehold.co/40x40/EA4335/FFFFFF?text=G" className="rounded-full" alt="Google Logo" />
                           <div className="ml-3">
                               <p className="font-semibold text-sm">Tina's Apple Turnerovers</p>
                               <p className="text-xs text-gray-100">Fetching data...</p>
                           </div>
                       </div>
                       <div className="w-full bg-gray-700 rounded-full h-1.5 mt-3">
                           <div className="bg-[#6914c1] h-1.5 rounded-full" style={{ width: '75%' }}></div>
                       </div>
                    </div>
                </StepCard>
                <StepCard number="02" title="AI Content & Design" description="Our system generates professional, SEO-friendly copy and crafts a beautiful, modern design tailored to your industry. Tweak anything you like in our simple editor." delay="0.4s">
                     <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-xs text-gray-100 font-mono">
                        <p>&gt; Analyzing business type: <span className="text-green-400">'Restaurant'</span></p>
                        <p>&gt; Generating 'About Us' section...</p>
                        <p>&gt; Crafting service descriptions...</p>
                        <p className="text-green-400 animate-pulse">&gt; Finalizing design... [Complete]</p>
                    </div>
                </StepCard>
                <StepCard number="03" title="Launch & Grow" description="Publish your site with one click. Now you have a powerful CRM, lead forms, and marketing tools built-in to turn visitors into loyal customers." delay="0.6s">
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-between">
                       <p className="font-semibold">yourbusiness.stellar.site</p>
                       <button className="bg-green-500 text-white text-sm font-bold py-1 px-3 rounded-full">Live</button>
                    </div>
                </StepCard>
            </div>
        </div>
    </section>
));

const FeatureCard = React.memo(({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: string }) => (
    <div className={`feature-card rounded-2xl p-8 card-anim animation-delay-${delay}`}>
        <div className="icon-bg w-14 h-14 rounded-xl flex items-center justify-center mb-5">
            {icon}
        </div>
        <h2 className="text-xl font-bold mb-3">{title}</h2>
        <p className="text-gray-500 font-normal">{description}</p>
    </div>
));

const FeaturesSection = React.memo(() => {
    const features = [
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6914c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
            title: "Google Business Profile",
            description: "Manage reviews, posts, and insights from one dashboard"
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6914c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
            title: "Local SEO Dominance",
            description: "Rank #1 for \"service near me\" searches in your area"
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6914c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
            title: "Automated Marketing",
            description: "Set up once, run forever. Email, SMS, and social posting"
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6914c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
            title: "Lead Management",
            description: "Never miss a lead with automated follow-up sequences"
        }
    ];

    return (
        <section id="features" className="py-20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">More Than a Website. It's a <span className="gradient-text">Growth Engine.</span></h2>
                    <p className="max-w-xl mx-auto text-gray-500 mt-4 text-lg font-normal">Everything you need to succeed online, managed from one simple dashboard.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard 
                            key={index}
                            icon={feature.icon} 
                            title={feature.title} 
                            description={feature.description}
                            delay={`${(index + 2) * 0.1}s`} 
                        />
                    ))}
                </div>
            </div>
        </section>
    );
});

const CtaSection = React.memo(() => (
    <section id="cta" className="py-24 bg-white">
        <div className="container mx-auto px-6">
            <div className="bg-gray-900 rounded-3xl p-10 md:p-20 text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#6914c1]/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-5 relative">Ready to Dominate Local Search?</h2>
                <p className="max-w-xl mx-auto text-gray-100 text-lg mb-10 relative font-normal">Join 500+ service businesses already ranking #1 in their area</p>
                <Link href="/signup" className="btn-primary text-white font-bold py-4 px-8 rounded-lg text-lg relative">Start Your Free Trial</Link>
                <p className="text-gray-500 mt-4 text-sm relative">14-day free trial • No credit card required • Setup in 10 minutes</p>
            </div>
        </div>
    </section>
));


// Main App Component
export default function LandingPage() {
    const appRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target instanceof HTMLElement) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        if (appRef.current) {
            const elements = appRef.current.querySelectorAll('.card-anim');
            elements.forEach((card: Element) => {
                observer.observe(card);
            });

            // Cleanup observer on component unmount
            return () => {
                elements.forEach((card: Element) => {
                    observer.unobserve(card);
                });
            };
        }
    }, []);

    return (
        <div ref={appRef} className="overflow-x-hidden">
            <Header />
            <main className="mt-20">
                <HeroSection />
                <HowItWorksSection />
                <FeaturesSection />
                <CtaSection />
            </main>
            <Footer />
        </div>
    );
}