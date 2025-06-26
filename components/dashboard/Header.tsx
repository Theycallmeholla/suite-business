'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Search, User, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SignOutButton } from '@/components/SignOutButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
}

export function Header({ userName, userEmail, userImage }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : userEmail?.[0]?.toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-30 bg-white border-b">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-md mr-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search sites, forms, contacts..."
              className="pl-10 pr-4 h-9 w-full"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Help */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            asChild
          >
            <Link href="/support">
              <HelpCircle className="h-5 w-5" />
            </Link>
          </Button>

          {/* Notifications */}
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <div className="space-y-2">
                  <div className="text-sm p-2 hover:bg-gray-50 rounded">
                    <p className="font-medium">New form submission</p>
                    <p className="text-gray-500 text-xs">2 minutes ago</p>
                  </div>
                  <div className="text-sm p-2 hover:bg-gray-50 rounded">
                    <p className="font-medium">Site published successfully</p>
                    <p className="text-gray-500 text-xs">1 hour ago</p>
                  </div>
                  <div className="text-sm p-2 hover:bg-gray-50 rounded">
                    <p className="font-medium">New contact added</p>
                    <p className="text-gray-500 text-xs">3 hours ago</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/dashboard/notifications">View all</Link>
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Profile Menu */}
          <Popover open={profileOpen} onOpenChange={setProfileOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userImage || undefined} alt={userName || ''} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56">
              <div className="space-y-1">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{userName || 'User'}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
                <div className="border-t pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/dashboard/settings/account">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </Button>
                  <div className="px-2 py-1">
                    <SignOutButton 
                      variant="ghost" 
                      size="sm"
                      className="w-full justify-start"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </SignOutButton>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}