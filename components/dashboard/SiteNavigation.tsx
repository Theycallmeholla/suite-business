'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  BarChart3,
  FileText,
  Globe,
  Home,
  Palette,
  Settings,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SiteNavItem {
  label: string;
  href: string;
  icon: any;
}

export function SiteNavigation({ businessName }: { businessName: string }) {
  const params = useParams();
  const pathname = usePathname();
  const siteId = params.id as string;

  const navigation: SiteNavItem[] = [
    {
      label: 'Overview',
      href: `/dashboard/sites/${siteId}`,
      icon: Home,
    },
    {
      label: 'Pages & Content',
      href: `/dashboard/sites/${siteId}/pages`,
      icon: FileText,
    },
    {
      label: 'Services',
      href: `/dashboard/sites/${siteId}/services`,
      icon: Building2,
    },
    {
      label: 'Design',
      href: `/dashboard/sites/${siteId}/design`,
      icon: Palette,
    },
    {
      label: 'Domain & SEO',
      href: `/dashboard/sites/${siteId}/seo`,
      icon: Globe,
    },
    {
      label: 'Analytics',
      href: `/dashboard/sites/${siteId}/analytics`,
      icon: BarChart3,
    },
    {
      label: 'Site Settings',
      href: `/dashboard/sites/${siteId}/settings`,
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="bg-white border-b sticky top-16 z-20">
      <div className="px-6 py-3">
        {/* Back Button and Site Name */}
        <div className="flex items-center gap-3 mb-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/sites">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Sites
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>/</span>
            <span className="font-medium text-gray-900">{businessName}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex gap-1 overflow-x-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                  active
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}