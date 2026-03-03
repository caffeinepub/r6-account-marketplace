import type React from "react";
import Footer from "./Footer";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  onNavigate?: (page: "marketplace" | "admin" | "vouches") => void;
  currentPage?: string;
}

export default function Layout({
  children,
  onNavigate,
  currentPage,
}: LayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "oklch(0.18 0 0)" }}
    >
      <Header onNavigate={onNavigate} currentPage={currentPage} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
