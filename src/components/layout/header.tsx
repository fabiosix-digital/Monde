import React from 'react';
import { useAuthStore } from '../../store/auth-store';
import { useThemeStore } from '../../store/theme-store';
import { Bell, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Header() {
  const { user, signOut } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const userFullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = user?.email || '';
  const userAvatar = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userFullName)}&background=random`;

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b px-4 shadow-lg sm:gap-x-6 sm:px-6 lg:px-8',
        isDark
          ? 'border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800'
          : 'border-gray-200 bg-gradient-to-r from-white to-gray-50'
      )}
    >
      <div className="flex flex-1 gap-x-4 self-stretch items-center justify-end md:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            onClick={toggleTheme}
            className={cn(
              '-m-2.5 p-2.5 transition-colors',
              isDark
                ? 'text-gray-400 hover:text-blue-400'
                : 'text-gray-600 hover:text-indigo-600'
            )}
          >
            <span className="sr-only">Alternar tema</span>
            {isDark ? (
              <Sun className="h-6 w-6" />
            ) : (
              <Moon className="h-6 w-6" />
            )}
          </button>
          <button
            type="button"
            className={cn(
              '-m-2.5 p-2.5 transition-colors',
              isDark
                ? 'text-gray-400 hover:text-blue-400'
                : 'text-gray-600 hover:text-indigo-600'
            )}
          >
            <span className="sr-only">Ver notificações</span>
            <Bell className="h-6 w-6" />
          </button>
          <button
            type="button"
            className={cn(
              '-m-2.5 p-2.5 transition-colors',
              isDark
                ? 'text-gray-400 hover:text-blue-400'
                : 'text-gray-600 hover:text-indigo-600'
            )}
          >
            <span className="sr-only">Configurações</span>
            <Settings className="h-6 w-6" />
          </button>
          <div
            className={cn(
              'hidden lg:block lg:h-6 lg:w-px',
              isDark ? 'lg:bg-gray-700' : 'lg:bg-gray-200'
            )}
          />
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <div className="hidden lg:block">
              <div className="flex items-center gap-x-4">
                <img
                  src={userAvatar}
                  alt=""
                  className={cn(
                    'h-10 w-10 rounded-full object-cover ring-2',
                    isDark
                      ? 'ring-blue-500'
                      : 'ring-indigo-600'
                  )}
                />
                <div className="flex flex-col">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isDark ? 'text-gray-200' : 'text-gray-900'
                    )}
                  >
                    {userFullName}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {userEmail}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className={cn(
                '-m-2.5 p-2.5 transition-colors',
                isDark
                  ? 'text-gray-400 hover:text-blue-400'
                  : 'text-gray-600 hover:text-indigo-600'
              )}
            >
              <span className="sr-only">Sair</span>
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}