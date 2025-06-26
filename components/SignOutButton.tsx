'use client';

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface SignOutButtonProps {
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function SignOutButton({ 
  variant = "ghost", 
  size = "default",
  showIcon = true,
  className,
  children
}: SignOutButtonProps) {
  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: '/signin',
      redirect: true 
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignOut}
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {children || "Sign Out"}
    </Button>
  );
}