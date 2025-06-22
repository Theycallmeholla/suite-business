import { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';
import React from 'react';

interface PlanLimits {
  locations: number;
  users: number;
  monthlyBlogPosts: number;
  gbpPosts: number;
  emailCredits?: number;
  smsCredits?: number;
}

interface Subscription {
  id: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        
        // Set limits based on plan
        if (data.subscription) {
          const planLimits = await fetchPlanLimits(data.subscription.plan);
          setLimits(planLimits);
        }
      }
    } catch (error) {
      // Silent fail - user might not have subscription
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanLimits = async (plan: string): Promise<PlanLimits> => {
    // This could be fetched from an API, but for now we'll use the config
    const { pricingPlans } = await import('@/lib/config/pricing');
    return pricingPlans[plan as keyof typeof pricingPlans].limits;
  };

  const hasFeature = (feature: string): boolean => {
    if (!subscription) return false;
    
    const plan = subscription.plan;
    
    switch (feature) {
      case 'email_marketing':
        return plan === 'professional' || plan === 'enterprise';
      case 'voice_calling':
        return plan === 'enterprise';
      case 'ai_chat':
        return plan === 'enterprise';
      case 'api_access':
        return plan === 'enterprise';
      case 'white_label':
        return plan === 'enterprise';
      case 'custom_forms':
        return plan === 'professional' || plan === 'enterprise';
      case 'advanced_analytics':
        return plan === 'professional' || plan === 'enterprise';
      case 'priority_support':
        return plan === 'professional' || plan === 'enterprise';
      default:
        return true;
    }
  };

  const checkLimit = (resource: keyof PlanLimits, currentUsage: number): boolean => {
    if (!limits) return false;
    
    const limit = limits[resource];
    if (limit === -1) return true; // Unlimited
    
    return currentUsage < limit;
  };

  const requiresUpgrade = (feature: string) => {
    if (!hasFeature(feature)) {
      toast.error('This feature requires an upgraded plan');
      return true;
    }
    return false;
  };

  return {
    subscription,
    limits,
    loading,
    hasFeature,
    checkLimit,
    requiresUpgrade,
  };
}

// HOC to protect features based on plan
export function withPlanProtection<P extends object>(
  Component: React.ComponentType<P>,
  requiredFeature: string,
  fallback?: React.ComponentType
) {
  return function ProtectedComponent(props: P) {
    const { hasFeature, loading } = useSubscription();

    if (loading) {
      return React.createElement('div', null, 'Loading...');
    }

    if (!hasFeature(requiredFeature)) {
      if (fallback) {
        const Fallback = fallback;
        return React.createElement(Fallback);
      }
      
      return React.createElement('div', { className: 'text-center py-12' },
        React.createElement('h2', { className: 'text-2xl font-semibold mb-2' }, 'Upgrade Required'),
        React.createElement('p', { className: 'text-muted-foreground mb-4' }, 
          'This feature is not available in your current plan.'
        ),
        React.createElement('a', { 
          href: '/pricing', 
          className: 'text-primary hover:underline' 
        }, 'View upgrade options')
      );
    }

    return React.createElement(Component, props);
  };
}
