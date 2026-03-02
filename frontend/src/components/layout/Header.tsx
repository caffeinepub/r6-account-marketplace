import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Shield, Menu, X, LogIn, LogOut, User, Settings } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await onLogout();
    } else {
      try {
        login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await onLogout();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/assets/generated/r6-market-icon.dim_64x64.png"
              alt="R6 Market"
              className="w-8 h-8 object-contain"
            />
            <span className="font-display text-xl font-bold text-gold tracking-wider hidden sm:block">
              R6 MARKET
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-gold transition-colors rounded-sm hover:bg-surface-raised"
              activeProps={{ className: 'text-gold bg-surface-raised' }}
            >
              Marketplace
            </Link>
            <Link
              to="/vouches"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-gold transition-colors rounded-sm hover:bg-surface-raised"
              activeProps={{ className: 'text-gold bg-surface-raised' }}
            >
              Reviews
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-gold transition-colors rounded-sm hover:bg-surface-raised"
                activeProps={{ className: 'text-gold bg-surface-raised' }}
              >
                <span className="flex items-center gap-1">
                  <Settings className="w-3.5 h-3.5" />
                  Admin
                </span>
              </Link>
            )}
          </nav>

          {/* Auth + Mobile */}
          <div className="flex items-center gap-3">
            {isAuthenticated && userProfile && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-3.5 h-3.5 text-gold" />
                <span className="text-foreground font-medium">{userProfile.name}</span>
              </div>
            )}
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              size="sm"
              variant={isAuthenticated ? 'outline' : 'default'}
              className={
                isAuthenticated
                  ? 'border-border text-muted-foreground hover:text-foreground hover:border-foreground'
                  : 'bg-gold text-background hover:bg-gold-bright font-semibold'
              }
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : isAuthenticated ? (
                <span className="flex items-center gap-2">
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </span>
              )}
            </Button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1 animate-slide-up">
            <Link
              to="/"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-gold hover:bg-surface-raised rounded-sm"
              onClick={() => setMobileOpen(false)}
            >
              Marketplace
            </Link>
            <Link
              to="/vouches"
              className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-gold hover:bg-surface-raised rounded-sm"
              onClick={() => setMobileOpen(false)}
            >
              Reviews
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-gold hover:bg-surface-raised rounded-sm"
                onClick={() => setMobileOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            {isAuthenticated && userProfile && (
              <div className="px-4 py-2 text-sm text-muted-foreground border-t border-border mt-2 pt-3">
                Logged in as <span className="text-gold font-medium">{userProfile.name}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
