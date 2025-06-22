'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, AlertCircle, Copy, Loader2, Info, ExternalLink,
  Globe, Server, Shield, Clock, HelpCircle, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface CustomDomainProps {
  siteId: string;
  subdomain: string;
  currentDomain: string | null;
}

interface DNSRecord {
  type: string;
  name: string;
  value: string;
  status?: 'valid' | 'invalid' | 'pending';
  ttl?: number;
}

export function CustomDomain({ siteId, subdomain, currentDomain }: CustomDomainProps) {
  const router = useRouter();
  const [domain, setDomain] = useState(currentDomain || '');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dnsStatus, setDnsStatus] = useState<{
    verified: boolean;
    records: Array<{ type: string; status: 'valid' | 'invalid' | 'pending' }>;
    sslStatus?: 'active' | 'pending' | 'none';
    lastChecked?: string;
  } | null>(null);

  // Auto-verify on mount if domain exists
  useEffect(() => {
    if (currentDomain) {
      verifyDomain();
    }
  }, [currentDomain]);

  const handleSave = async () => {
    if (!domain) {
      toast.error('Please enter a domain');
      return;
    }

    // Validate domain format
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    const cleanDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .trim();

    if (!domainRegex.test(cleanDomain)) {
      toast.error('Please enter a valid domain (e.g., yourbusiness.com)');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/sites/${siteId}/domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update domain');
      }

      toast.success('Domain added successfully! Now configure your DNS.');
      router.refresh();
      
      // Start verification after a short delay
      setTimeout(() => verifyDomain(), 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update domain');
    } finally {
      setLoading(false);
    }
  };

  const verifyDomain = async () => {
    setVerifying(true);
    try {
      const response = await fetch(`/api/sites/${siteId}/domain/verify`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to verify domain');
      }

      const data = await response.json();
      setDnsStatus({
        ...data,
        lastChecked: new Date().toLocaleTimeString()
      });

      if (data.verified) {
        toast.success('Domain verified successfully!');
      }
    } catch (error) {
      toast.error('Failed to verify domain');
    } finally {
      setVerifying(false);
    }
  };

  const removeDomain = async () => {
    if (!confirm('Are you sure you want to remove the custom domain? Your site will only be accessible via the subdomain.')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/sites/${siteId}/domain`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove domain');
      }

      setDomain('');
      setDnsStatus(null);
      toast.success('Domain removed successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to remove domain');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Your platform's IP address or CNAME target
  const platformIP = process.env.NEXT_PUBLIC_PLATFORM_IP || 'YOUR_SERVER_IP';
  const cnameTarget = `sites.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'yourdomain.com'}`;

  // DNS Records needed
  const dnsRecords: DNSRecord[] = [
    {
      type: 'A',
      name: '@',
      value: platformIP,
      ttl: 3600
    },
    {
      type: 'A',
      name: 'www',
      value: platformIP,
      ttl: 3600
    }
  ];

  const cnameRecords: DNSRecord[] = [
    {
      type: 'A',
      name: '@',
      value: platformIP,
      ttl: 3600
    },
    {
      type: 'CNAME',
      name: 'www',
      value: cnameTarget,
      ttl: 3600
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Domain</CardTitle>
          <CardDescription>
            Connect your own domain to your site. Your site will be accessible via both your custom domain and subdomain.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Domain Name</label>
            <div className="flex gap-2">
              <Input
                placeholder="yourbusiness.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={loading}
                className="font-mono"
              />
              <Button onClick={handleSave} disabled={loading || !domain}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentDomain ? 'Update' : 'Add Domain'}
              </Button>
              {currentDomain && (
                <Button variant="outline" onClick={removeDomain} disabled={loading}>
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your domain without www or https://
            </p>
          </div>

          {/* Current Access URLs */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Current Access URLs
            </h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subdomain:</span>
                <code className="text-xs bg-background px-2 py-1 rounded">
                  https://{subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'yourdomain.com'}
                </code>
              </div>
              {currentDomain && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Custom Domain:</span>
                  <code className="text-xs bg-background px-2 py-1 rounded">
                    https://{currentDomain}
                  </code>
                </div>
              )}
            </div>
          </div>

          {currentDomain && (
            <>
              {/* Domain Status */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">Domain Status</h4>
                    {dnsStatus?.lastChecked && (
                      <p className="text-xs text-muted-foreground">
                        Last checked: {dnsStatus.lastChecked}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={verifyDomain}
                    disabled={verifying}
                  >
                    {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {verifying ? 'Checking...' : 'Verify DNS'}
                  </Button>
                </div>

                {dnsStatus ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {dnsStatus.verified ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Domain Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Configuration Pending
                        </Badge>
                      )}
                      
                      {dnsStatus.sslStatus === 'active' && (
                        <Badge variant="outline" className="gap-1">
                          <Shield className="h-3 w-3" />
                          SSL Active
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {dnsStatus.records.map((record, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {record.status === 'valid' ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : record.status === 'pending' ? (
                            <Clock className="h-3 w-3 text-yellow-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className="font-mono text-xs">{record.type}</span>
                          <span className="text-muted-foreground">record:</span>
                          <span className="capitalize">{record.status}</span>
                        </div>
                      ))}
                    </div>

                    {!dnsStatus.verified && (
                      <Alert className="mt-3">
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          DNS changes can take 5-48 hours to propagate worldwide. Keep checking back!
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click "Verify DNS" to check your domain configuration
                  </p>
                )}
              </div>

              {/* DNS Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">DNS Configuration</CardTitle>
                  <CardDescription>
                    Configure these DNS records with your domain registrar (GoDaddy, Namecheap, etc.)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="simple" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="simple">Simple Setup</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced Setup</TabsTrigger>
                    </TabsList>

                    <TabsContent value="simple" className="space-y-4 mt-4">
                      <Alert>
                        <Server className="h-4 w-4" />
                        <AlertTitle>AlmaLinux VPS Configuration</AlertTitle>
                        <AlertDescription>
                          Add these DNS records at your domain registrar:
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        {dnsRecords.map((record, i) => (
                          <div key={i} className="rounded-lg border p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{record.type} Record</Badge>
                                  <span className="text-sm font-medium">
                                    {record.name === '@' ? currentDomain : `${record.name}.${currentDomain}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                    {record.value}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(record.value)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 space-y-2">
                        <h5 className="font-medium text-sm flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Quick Setup Guide
                        </h5>
                        <ol className="text-sm space-y-1 ml-6">
                          <li>1. Log in to your domain registrar (where you bought the domain)</li>
                          <li>2. Find "DNS Settings" or "Manage DNS"</li>
                          <li>3. Delete any existing A records for @ and www</li>
                          <li>4. Add the two A records shown above</li>
                          <li>5. Save changes and wait 5-30 minutes</li>
                        </ol>
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-4 mt-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Alternative: CNAME Setup</AlertTitle>
                        <AlertDescription>
                          Use this method if you prefer CNAME records for the www subdomain
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        {cnameRecords.map((record, i) => (
                          <div key={i} className="rounded-lg border p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{record.type} Record</Badge>
                                  <span className="text-sm font-medium">
                                    {record.name === '@' ? currentDomain : `${record.name}.${currentDomain}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                    {record.value}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(record.value)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  TTL: {record.ttl} seconds
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription className="space-y-2">
                          <p className="font-medium">SSL Certificate</p>
                          <p className="text-xs">
                            SSL certificates will be automatically provisioned using Let's Encrypt once DNS is verified.
                            This process is automatic and requires no additional configuration.
                          </p>
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Troubleshooting */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Troubleshooting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Domain not verifying?</p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• DNS changes can take up to 48 hours to propagate</li>
                      <li>• Ensure you removed any conflicting records</li>
                      <li>• Check that you entered the IP address correctly</li>
                      <li>• Try clearing your browser cache</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Popular Domain Registrars</p>
                    <div className="flex flex-wrap gap-2">
                      {['GoDaddy', 'Namecheap', 'Google Domains', 'Cloudflare', 'Porkbun'].map(registrar => (
                        <Button
                          key={registrar}
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://www.google.com/search?q=${registrar}+DNS+settings`, '_blank')}
                        >
                          {registrar}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}