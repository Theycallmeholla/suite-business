import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, MapPin, Search, TrendingUp, Star, Phone, Clock, Users } from 'lucide-react';

export default function HomePage() {
  const industries = [
    { name: 'Landscaping', icon: '?', slug: 'landscaping' },
    { name: 'HVAC', icon: '??', slug: 'hvac' },
    { name: 'Plumbing', icon: '?', slug: 'plumbing' },
    { name: 'Cleaning', icon: '?', slug: 'cleaning' },
    { name: 'Roofing', icon: '?', slug: 'roofing' },
    { name: 'Electrical', icon: '?', slug: 'electrical' },
  ];

  const features = [
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Google Business Profile',
      description: 'Manage reviews, posts, and insights from one dashboard',
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Local SEO Dominance',
      description: 'Rank #1 for "service near me" searches in your area',
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Automated Marketing',
      description: 'Set up once, run forever. Email, SMS, and social posting',
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Lead Management',
      description: 'Never miss a lead with automated follow-up sequences',
    },
  ];

  const testimonials = [
    {
      name: "Bob's Landscaping",
      rating: 5,
      text: "Went from page 3 to #1 on Google in 60 days. Now booking 3x more jobs!",
    },
    {
      name: "Elite HVAC Services",
      rating: 5,
      text: "The automated review requests alone paid for the whole system. Game changer.",
    },
    {
      name: "Pro Plumbing Co",
      rating: 5,
      text: "Finally, one platform for everything. Saved us 20 hours a week easily.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-xl font-bold">Suite Business</span>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="#industries" className="text-gray-600 hover:text-gray-900">Industries</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900">Sign In</Link>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Get Your Service Business to{' '}
            <span className="text-blue-600">Rank #1 on Google</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional website, Google Business Profile management, and automated marketing. 
            Everything you need to dominate local search and book more jobs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#demo">Watch Demo</Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            No credit card required ? Setup in 10 minutes ? Cancel anytime
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-4 bg-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600">Businesses Ranked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">4.9/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">3x</div>
              <div className="text-gray-600">More Leads</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">60%</div>
              <div className="text-gray-600">Time Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything You Need to Grow
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Built for Service Businesses
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Industry-specific templates and automation designed for your business
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry) => (
              <Card 
                key={industry.slug} 
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-4xl">{industry.icon}</span>
                  <h3 className="text-xl font-semibold">{industry.name}</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Industry-specific website template
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    Pre-built marketing automations
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    SEO optimized for your services
                  </li>
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Join 500+ Successful Service Businesses
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <p className="font-semibold">{testimonial.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            No hidden fees. No contracts. Cancel anytime.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <div className="text-3xl font-bold mb-4">$297<span className="text-lg font-normal">/mo</span></div>
              <p className="text-gray-600">Perfect for getting started</p>
            </Card>
            <Card className="p-6 border-blue-600 border-2 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <div className="text-3xl font-bold mb-4">$597<span className="text-lg font-normal">/mo</span></div>
              <p className="text-gray-600">Everything you need to grow</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="text-3xl font-bold mb-4">$997<span className="text-lg font-normal">/mo</span></div>
              <p className="text-gray-600">For established businesses</p>
            </Card>
          </div>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/auth/signup">Start Your Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Dominate Local Search?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 500+ service businesses already ranking #1 in their area
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/signup">Get Started Now - It's Free</Link>
          </Button>
          <p className="mt-4 text-sm opacity-75">
            14-day free trial ? No credit card required ? Setup in 10 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="text-xl font-bold">Suite Business</span>
              </div>
              <p className="text-gray-600">
                The complete platform for service business growth.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#pricing">Pricing</Link></li>
                <li><Link href="#industries">Industries</Link></li>
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
              <Button className="w-full" asChild>
                <Link href="/auth/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-gray-600">
            <p>&copy; 2024 Suite Business. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
