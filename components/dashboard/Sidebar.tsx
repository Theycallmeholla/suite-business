'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Building2,
  LayoutDashboard,
  Globe,
  BarChart3,
  Users,
  FileText,
  Plug,
  CreditCard,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href?: string;
  icon: any;
  children?: {
    label: string;
    href: string;
  }[];
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Sites',
    icon: Globe,
    children: [
      { label: 'All Sites', href: '/dashboard/sites' },
      { label: 'Add New Site', href: '/onboarding' },
    ],
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    label: 'CRM',
    icon: Users,
    children: [
      { label: 'Contacts', href: '/dashboard/crm/contacts' },
      { label: 'Leads', href: '/dashboard/crm/leads' },
      { label: 'Opportunities', href: '/dashboard/crm/opportunities' },
    ],
  },
  {
    label: 'Forms',
    icon: FileText,
    children: [
      { label: 'All Forms', href: '/dashboard/forms' },
      { label: 'Submissions', href: '/dashboard/forms/submissions' },
    ],
  },
  {
    label: 'Integrations',
    href: '/dashboard/integrations',
    icon: Plug,
  },
  {
    label: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCard,
  },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { label: 'Account', href: '/dashboard/settings/account' },
      { label: 'Team', href: '/dashboard/settings/team' },
      { label: 'API Keys', href: '/dashboard/settings/api' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isParentActive = (item: NavItem) => {
    if (item.href && isActive(item.href)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.href));
    }
    return false;
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b">
        <Link href="/dashboard" className="flex items-center">
          <Image 
            src="/sitebango-logo.svg" 
            alt="Sitebango" 
            width={140} 
            height={35}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedItems.includes(item.label);
            const isItemActive = isParentActive(item);

            return (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isItemActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        isItemActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 mr-3" />
                        {item.label}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {isExpanded && item.children && (
                      <ul className="mt-1 ml-8 space-y-1">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                                isActive(child.href)
                                  ? 'text-primary font-medium'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              )}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Action */}
      <div className="p-4 border-t">
        <Button asChild className="w-full">
          <Link href="/onboarding">
            <Plus className="h-4 w-4 mr-2" />
            Create New Site
          </Link>
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <NavContent />
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:border-r">
        <NavContent />
      </aside>
    </>
  );
}