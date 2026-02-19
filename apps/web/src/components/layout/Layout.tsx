import { ReactNode } from 'react';
import { Header } from './Header';
import { MobileTabBar } from './MobileTabBar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        {children}
      </main>
      <MobileTabBar />
    </div>
  );
}
