import { ContactSection } from '@/types/site-builder';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

interface ContactProps {
  section: ContactSection;
  siteData: {
    businessName: string;
    primaryColor: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  };
}

export function Contact({ section, siteData }: ContactProps) {
  const { data } = section;
  
  const fullAddress = [
    siteData.address,
    siteData.city,
    siteData.state,
    siteData.zip
  ].filter(Boolean).join(', ');

  const contactInfo = (
    <div className="space-y-4">
      {siteData.phone && (
        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 mt-1" style={{ color: siteData.primaryColor }} />
          <div>
            <p className="font-semibold">Phone</p>
            <a href={`tel:${siteData.phone}`} className="text-gray-600 hover:underline">
              {siteData.phone}
            </a>
          </div>
        </div>
      )}
      
      {siteData.email && (
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 mt-1" style={{ color: siteData.primaryColor }} />
          <div>
            <p className="font-semibold">Email</p>
            <a href={`mailto:${siteData.email}`} className="text-gray-600 hover:underline">
              {siteData.email}
            </a>
          </div>
        </div>
      )}
      
      {fullAddress && (
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 mt-1" style={{ color: siteData.primaryColor }} />
          <div>
            <p className="font-semibold">Address</p>
            <p className="text-gray-600">{fullAddress}</p>
          </div>
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 mt-1" style={{ color: siteData.primaryColor }} />
        <div>
          <p className="font-semibold">Business Hours</p>
          <p className="text-gray-600">Mon-Fri: 8:00 AM - 6:00 PM</p>
          <p className="text-gray-600">Sat: 9:00 AM - 4:00 PM</p>
          <p className="text-gray-600">Sun: Closed</p>
        </div>
      </div>
    </div>
  );

  const contactForm = (
    <form className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': siteData.primaryColor } as React.CSSProperties}
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': siteData.primaryColor } as React.CSSProperties}
        />
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': siteData.primaryColor } as React.CSSProperties}
        />
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          Message
        </label>
        <textarea
          id="message"
          rows={4}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': siteData.primaryColor } as React.CSSProperties}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        style={{ backgroundColor: siteData.primaryColor }}
      >
        Send Message
      </Button>
    </form>
  );

  if (data.variant === 'split') {
    return (
      <section className="py-16 md:py-24 bg-gray-50" id="contact">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{data.title}</h2>
            {data.subtitle && (
              <p className="text-xl text-gray-600">
                {data.subtitle}
              </p>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {data.showForm && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Send us a message</h3>
                {contactForm}
              </Card>
            )}
            
            {data.showInfo && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Get in touch</h3>
                {contactInfo}
              </Card>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (data.variant === 'centered') {
    return (
      <section className="py-16 md:py-24" id="contact">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{data.title}</h2>
            {data.subtitle && (
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {data.subtitle}
              </p>
            )}
          </div>
          
          <div className="max-w-lg mx-auto">
            {data.showForm && contactForm}
            {data.showInfo && (
              <div className="mt-8 text-center">
                {contactInfo}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Minimal variant
  return (
    <section className="py-16 md:py-24 bg-gray-900 text-white" id="contact">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">{data.title}</h2>
        
        <div className="flex flex-wrap justify-center gap-8">
          {siteData.phone && (
            <a 
              href={`tel:${siteData.phone}`}
              className="flex items-center gap-2 text-lg hover:underline"
            >
              <Phone className="w-5 h-5" />
              {siteData.phone}
            </a>
          )}
          
          {siteData.email && (
            <a 
              href={`mailto:${siteData.email}`}
              className="flex items-center gap-2 text-lg hover:underline"
            >
              <Mail className="w-5 h-5" />
              {siteData.email}
            </a>
          )}
          
          {fullAddress && (
            <div className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5" />
              {fullAddress}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
