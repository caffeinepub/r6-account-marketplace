import React from 'react';
import { Swords } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Swords className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Ascension's Market</span>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Premium Rainbow Six Siege account marketplace.</p>
            <p className="mt-1">All transactions are secure and verified.</p>
          </div>

          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Ascension's Market. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
