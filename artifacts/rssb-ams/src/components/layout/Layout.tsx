import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      <div className="pt-16 flex h-[100dvh]">
        <Sidebar />
        <main className="flex-1 ml-56 p-6 overflow-y-auto bg-muted/30">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
