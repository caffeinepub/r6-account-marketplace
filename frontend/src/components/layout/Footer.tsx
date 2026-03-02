import React from 'react';
import { Link } from '@tanstack/react-router';
import { Shield, Heart } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'r6-account-marketplace');

  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/r6-market-icon.dim_64x64.png"
              alt="R6 Market"
              className="w-6 h-6 object-contain opacity-70"
            />
            <span className="font-display text-sm font-bold text-gold/70 tracking-wider">
              R6 MARKET
            </span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-gold transition-colors">Marketplace</Link>
            <Link to="/vouches" className="hover:text-gold transition-colors">Reviews</Link>
          </nav>

          {/* Attribution */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-crimson fill-crimson" />
            <span>using</span>
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-bright transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 text-center text-xs text-muted-foreground/50">
          © {year} R6 Market. All account credentials are encrypted and secured on the Internet Computer.
        </div>
      </div>
    </footer>
  );
}
