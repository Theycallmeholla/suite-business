'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, X } from 'lucide-react';
import { toast } from '@/lib/toast';
import { pricingPlans } from '@/lib/config/pricing';

const plans = [
  {
    key: 'starter' as const,
    ...pricingPlans.starter,
    description: 'Perfect for getting started with your online presence',
  },
  {
    key: 'professional' as const,
    ...pricingPlans.professional,
    description: 'Everything you need to grow your business',
  },
  {
    key: 'enterprise' as const,
    ...pricingPlans.enterprise,
    description: 'Advanced features for established businesses',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planKey: 'starter' | 'professional' | 'enterprise') => {
    try {
      setLoadingPlan(planKey);

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planKey }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      toast.error('Failed to start checkout process');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">
          Select the perfect plan for your business needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.key}
            className={plan.key === 'professional' ? 'border-primary shadow-lg scale-105' : ''}
          >
            <CardHeader>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </div>
                {plan.key === 'professional' && (
                  <Badge variant="default">Popular</Badge>
                )}
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground ml-2">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full mb-6"
                size="lg"
                variant={plan.key === 'professional' ? 'default' : 'outline'}
                onClick={() => handleSelectPlan(plan.key)}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === plan.key ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Get Started with ${plan.name}`
                )}
              </Button>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Features
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-6 border-t space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Limits
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Locations</span>
                    <span className="font-medium">
                      {plan.limits.locations === -1 ? 'Unlimited' : plan.limits.locations}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Users</span>
                    <span className="font-medium">
                      {plan.limits.users === -1 ? 'Unlimited' : plan.limits.users}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blog Posts/Month</span>
                    <span className="font-medium">{plan.limits.monthlyBlogPosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GBP Posts/Month</span>
                    <span className="font-medium">
                      {plan.limits.gbpPosts === -1 ? 'Unlimited' : plan.limits.gbpPosts}
                    </span>
                  </div>
                  {'emailCredits' in plan.limits && plan.limits.emailCredits !== undefined && (
                    <div className="flex justify-between">
                      <span>Email Credits</span>
                      <span className="font-medium">{'emailCredits' in plan.limits ? plan.limits.emailCredits : 0}</span>
                    </div>
                  )}
                  {'smsCredits' in plan.limits && plan.limits.smsCredits !== undefined && (
                    <div className="flex justify-between">
                      <span>SMS Credits</span>
                      <span className="font-medium">{'smsCredits' in plan.limits ? plan.limits.smsCredits : 0}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6 text-left">
          <div>
            <h3 className="font-semibold mb-2">Can I change my plan later?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate the billing.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
            <p className="text-muted-foreground">
              We offer a 14-day money-back guarantee. If you're not satisfied within the first 14 days, we'll refund your payment in full.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards, debit cards, and bank transfers through our secure payment processor, Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
