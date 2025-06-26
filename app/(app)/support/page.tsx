import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { 
  HelpCircle, 
  Book, 
  MessageCircle, 
  Mail,
  FileText,
  Video,
  Search,
  ArrowRight,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default async function SupportPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  const popularArticles = [
    {
      title: 'Getting Started with SiteBango',
      description: 'Learn the basics of creating and managing your first site',
      icon: Zap,
      link: '/support/getting-started'
    },
    {
      title: 'Domain Setup Guide',
      description: 'How to connect your custom domain to your site',
      icon: Globe,
      link: '/support/domain-setup'
    },
    {
      title: 'Managing Forms and Submissions',
      description: 'Create forms and handle customer inquiries',
      icon: FileText,
      link: '/support/forms-guide'
    },
    {
      title: 'Security Best Practices',
      description: 'Keep your account and sites secure',
      icon: Shield,
      link: '/support/security'
    },
  ];

  const supportChannels = [
    {
      title: 'Documentation',
      description: 'Browse our comprehensive guides and tutorials',
      icon: Book,
      action: 'View Docs',
      link: '/docs'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      icon: Video,
      action: 'Watch Videos',
      link: '/tutorials'
    },
    {
      title: 'Community Forum',
      description: 'Get help from other SiteBango users',
      icon: MessageCircle,
      action: 'Visit Forum',
      link: '/community'
    },
    {
      title: 'Email Support',
      description: 'Contact our support team directly',
      icon: Mail,
      action: 'Send Email',
      link: 'mailto:support@suitebusiness.com'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back to Dashboard */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          ← Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">How can we help?</h1>
          <p className="text-xl text-gray-600 mb-8">
            Search our knowledge base or browse categories below
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for help..."
                className="pl-10 pr-4 h-12 text-lg"
              />
            </div>
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Popular Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularArticles.map((article) => {
              const Icon = article.icon;
              return (
                <Card key={article.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Link href={article.link} className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{article.title}</h3>
                        <p className="text-sm text-gray-600">{article.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Support Channels */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Get Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {supportChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <Card key={channel.title}>
                  <CardHeader className="text-center pb-4">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-gray-600" />
                    </div>
                    <CardTitle className="text-lg">{channel.title}</CardTitle>
                    <CardDescription>{channel.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={channel.link}>
                        {channel.action}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contact Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <HelpCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to assist you with any questions or issues
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="mailto:support@suitebusiness.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/settings/account">
                  Account Settings
                </Link>
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Average response time: 24 hours
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}