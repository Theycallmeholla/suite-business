'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink, Server, Shield, Clock, ChevronRight, 
  Globe, Terminal, FileText, CheckCircle2
} from 'lucide-react';

export function DomainHelp() {
  const registrarGuides = [
    {
      name: 'GoDaddy',
      url: 'https://www.godaddy.com/help/manage-dns-records-680',
      steps: [
        'Sign in to your GoDaddy Domain Portfolio',
        'Click on your domain name',
        'Select "DNS" from the menu',
        'Click "Add" to create new records',
        'Add A records as shown in the setup guide'
      ]
    },
    {
      name: 'Namecheap',
      url: 'https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/',
      steps: [
        'Sign in to your Namecheap account',
        'Select "Domain List" from the left sidebar',
        'Click "Manage" next to your domain',
        'Navigate to the "Advanced DNS" tab',
        'Add new A records using the "Add New Record" button'
      ]
    },
    {
      name: 'Cloudflare',
      url: 'https://developers.cloudflare.com/dns/manage-dns-records/',
      steps: [
        'Log in to the Cloudflare dashboard',
        'Select your domain',
        'Go to the DNS section',
        'Click "Add record"',
        'Add A records and ensure proxy is disabled initially'
      ]
    },
    {
      name: 'Google Domains',
      url: 'https://support.google.com/domains/answer/3290350',
      steps: [
        'Sign in to Google Domains',
        'Click on your domain',
        'Select "DNS" from the left menu',
        'Scroll to "Custom resource records"',
        'Add the A records as specified'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Domain Setup Guide</CardTitle>
          <CardDescription>
            Complete guide for connecting your custom domain to your site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="registrars">Registrar Guides</TabsTrigger>
              <TabsTrigger value="vps">VPS Setup</TabsTrigger>
              <TabsTrigger value="ssl">SSL & Security</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">How Custom Domains Work</h3>
                
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">User enters your domain</h4>
                      <p className="text-sm text-muted-foreground">
                        When someone types "yourbusiness.com" in their browser
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">DNS lookup occurs</h4>
                      <p className="text-sm text-muted-foreground">
                        The browser checks DNS records to find where to send the request
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Request reaches our server</h4>
                      <p className="text-sm text-muted-foreground">
                        Your AlmaLinux VPS receives the request and identifies your site
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Site is served</h4>
                      <p className="text-sm text-muted-foreground">
                        Your custom site is displayed with SSL encryption
                      </p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertTitle>Two Access Methods</AlertTitle>
                  <AlertDescription>
                    Your site will always be accessible via both:
                    <ul className="mt-2 space-y-1">
                      <li>• Your subdomain: <code>business.yourdomain.com</code></li>
                      <li>• Your custom domain: <code>yourbusiness.com</code></li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="registrars" className="space-y-4 mt-4">
              <h3 className="font-medium text-lg">Step-by-Step Registrar Guides</h3>
              
              <div className="space-y-4">
                {registrarGuides.map((guide) => (
                  <Card key={guide.name}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{guide.name}</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(guide.url, '_blank')}
                        >
                          Official Guide
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2">
                        {guide.steps.map((step, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="font-medium text-muted-foreground">{i + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Remember: DNS changes can take 5-48 hours to fully propagate worldwide. 
                  Most changes are visible within 30 minutes.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="vps" className="space-y-4 mt-4">
              <h3 className="font-medium text-lg">AlmaLinux VPS Configuration</h3>
              
              <Alert>
                <Server className="h-4 w-4" />
                <AlertTitle>Server Requirements</AlertTitle>
                <AlertDescription>
                  Your AlmaLinux VPS needs to be configured with:
                  <ul className="mt-2 space-y-1">
                    <li>• Nginx or Apache web server</li>
                    <li>• Port 80 and 443 open in firewall</li>
                    <li>• Certbot installed for SSL certificates</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Nginx Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Add this server block to handle custom domains:
                    </p>
                    <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs">
{`server {
    listen 80;
    server_name _;  # Catch-all for custom domains
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`}
                    </pre>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">After adding the configuration:</p>
                      <ol className="space-y-1 text-sm text-muted-foreground ml-4">
                        <li>1. Test nginx config: <code className="bg-muted px-1">nginx -t</code></li>
                        <li>2. Reload nginx: <code className="bg-muted px-1">systemctl reload nginx</code></li>
                        <li>3. Set up SSL with Certbot (see SSL tab)</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Firewall Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Ensure these ports are open in your firewall:
                    </p>
                    <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs">
{`# Open HTTP and HTTPS ports
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Verify
sudo firewall-cmd --list-all`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ssl" className="space-y-4 mt-4">
              <h3 className="font-medium text-lg">SSL Certificate Setup</h3>
              
              <Alert className="mb-4">
                <Shield className="h-4 w-4" />
                <AlertTitle>Automatic SSL with Let's Encrypt</AlertTitle>
                <AlertDescription>
                  Free SSL certificates are automatically provisioned for verified domains
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Install Certbot on AlmaLinux</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs">
{`# Install EPEL repository
sudo dnf install epel-release -y

# Install Certbot and Nginx plugin
sudo dnf install certbot python3-certbot-nginx -y

# Obtain certificate for your domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">SSL Best Practices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Enable auto-renewal</p>
                        <p className="text-xs text-muted-foreground">
                          Certbot sets up a cron job automatically
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Force HTTPS redirect</p>
                        <p className="text-xs text-muted-foreground">
                          Certbot configures this automatically when you select "redirect"
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Monitor certificate expiry</p>
                        <p className="text-xs text-muted-foreground">
                          Set up monitoring to alert before certificates expire
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Quick SSL Status Check</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    sudo certbot certificates
                  </code>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}