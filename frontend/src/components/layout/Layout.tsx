import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate?: (page: 'marketplace' | 'admin' | 'vouches') => void;
  currentPage?: string;
}

export default function Layout({ children, onNavigate, currentPage }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onNavigate={onNavigate} currentPage={currentPage} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
