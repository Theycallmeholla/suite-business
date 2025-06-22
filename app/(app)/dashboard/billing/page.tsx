'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CreditCard, CheckCircle, XCircle, Loader2, ExternalLink, Calendar, Users, FileText, Mail } from 'lucide-react';
import { toast } from '@/lib/toast';
import { pricingPlans } from '@/lib/config/pricing';

interface Subscription {
  id: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface Usage {
  locations: { used: number; limit: number };
  users: { used: number; limit: number };
  monthlyBlogPosts: { used: number; limit: number };
  gbpPosts: { used: number; limit: number };
  emailCredits?: { used: number; limit: number };
  smsCredits?: { used: number; limit: number };
}

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  // Check for success/cancel params
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Subscription activated successfully!');
      // Remove query params
      router.replace('/dashboard/billing');
    } else if (searchParams.get('canceled') === 'true') {
      toast.error('Subscription was canceled');
      router.replace('/dashboard/billing');
    }
  }, [searchParams, router]);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const [subResponse, usageResponse] = await Promise.all([
        fetch('/api/user/subscription'),
        fetch('/api/user/usage'),
      ]);

      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData.subscription);
      }

      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsage(usageData.usage);
      }
    } catch (error) {
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setPortalLoading(true);
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast.error('Failed to open billing portal');
      setPortalLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'trialing':
        return 'bg-blue-500';
      case 'past_due':
        return 'bg-yellow-500';
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view usage
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </div>
            <Button
              onClick={handleManageBilling}
              disabled={portalLoading || !subscription}
              variant="outline"
            >
              {portalLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Billing
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-2xl font-semibold">
                    {pricingPlans[subscription.plan].name} Plan
                  </h3>
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    ${pricingPlans[subscription.plan].price}/mo
                  </p>
                </div>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your subscription will be canceled on {formatDate(subscription.currentPeriodEnd)}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {subscription.cancelAtPeriodEnd
                    ? `Access until ${formatDate(subscription.currentPeriodEnd)}`
                    : `Renews on ${formatDate(subscription.currentPeriodEnd)}`}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You don't have an active subscription
              </p>
              <Button onClick={() => router.push('/pricing')}>
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage */}
      {subscription && usage && (
        <Card>
          <CardHeader>
            <CardTitle>Usage & Limits</CardTitle>
            <CardDescription>Track your resource usage against plan limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Locations */}
              <div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Locations</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usage.locations.used} / {usage.locations.limit === -1 ? 'Unlimited' : usage.locations.limit}
                  </span>
                </div>
                {usage.locations.limit !== -1 && (
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${getUsagePercentage(usage.locations.used, usage.locations.limit)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Users */}
              <div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Team Members</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usage.users.used} / {usage.users.limit === -1 ? 'Unlimited' : usage.users.limit}
                  </span>
                </div>
                {usage.users.limit !== -1 && (
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${getUsagePercentage(usage.users.used, usage.users.limit)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Blog Posts */}
              <div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Blog Posts (This Month)</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usage.monthlyBlogPosts.used} / {usage.monthlyBlogPosts.limit}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${getUsagePercentage(usage.monthlyBlogPosts.used, usage.monthlyBlogPosts.limit)}%` }}
                  />
                </div>
              </div>

              {/* GBP Posts */}
              <div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">GBP Posts (This Month)</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usage.gbpPosts.used} / {usage.gbpPosts.limit === -1 ? 'Unlimited' : usage.gbpPosts.limit}
                  </span>
                </div>
                {usage.gbpPosts.limit !== -1 && (
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${getUsagePercentage(usage.gbpPosts.used, usage.gbpPosts.limit)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Email Credits */}
              {usage.emailCredits && (
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email Credits (This Month)</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {usage.emailCredits.used} / {usage.emailCredits.limit}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${getUsagePercentage(usage.emailCredits.used, usage.emailCredits.limit)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade CTA */}
      {subscription && subscription.plan !== 'enterprise' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Need more resources?</h3>
                <p className="text-sm text-muted-foreground">
                  Upgrade your plan to unlock additional features and higher limits
                </p>
              </div>
              <Button onClick={() => router.push('/pricing')}>
                View Upgrade Options
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
