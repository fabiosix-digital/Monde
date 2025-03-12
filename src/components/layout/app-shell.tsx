import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useThemeStore } from '../../store/theme-store';
import { cn } from '../../lib/utils';

export function AppShell() {
  const { isDark } = useThemeStore();

  return (
    <div
      className={cn(
        'h-screen flex',
        isDark
          ? 'bg-gradient-to-br from-gray-950 to-gray-900'
          : 'bg-gradient-to-br from-gray-50 to-white'
      )}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header />
        <main className="flex-1 overflow-hidden">
          <div className="h-full p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}