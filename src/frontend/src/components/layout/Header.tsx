import { useQueryClient } from "@tanstack/react-query";
import { Menu, Shield, Swords, X } from "lucide-react";
import React, { useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface HeaderProps {
  onNavigate?: (page: "marketplace" | "admin" | "vouches") => void;
  currentPage?: string;
}

export default function Header({ onNavigate, currentPage }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navItems = [
    { label: "Marketplace", page: "marketplace" as const },
    { label: "Reviews", page: "vouches" as const },
    { label: "Admin", page: "admin" as const },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate?.("marketplace")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Swords className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground hidden sm:block">
            Ascension's Market
          </span>
          <span className="font-bold text-lg text-foreground sm:hidden">
            Ascension's
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.page}
              onClick={() => onNavigate?.(item.page)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === item.page
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Auth + Mobile Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAuth}
            disabled={isLoggingIn}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              isAuthenticated
                ? "bg-muted text-muted-foreground hover:bg-muted/80"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isLoggingIn
              ? "Logging in..."
              : isAuthenticated
                ? "Logout"
                : "Login"}
          </button>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.page}
              onClick={() => {
                onNavigate?.(item.page);
                setMobileOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentPage === item.page
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
