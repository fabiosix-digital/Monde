import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/auth-store';
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const getNavigation = (isAdmin: boolean) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Atendimentos', href: '/atendimentos', icon: KanbanSquare },
    { name: 'Usuários', href: '/usuarios', icon: Users },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  if (isAdmin) {
    baseNavigation.push({ name: 'Monde', href: '/monde', icon: Building2 });
  }

  return baseNavigation;
};

export function Sidebar() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useAuthStore();
  const isAdmin = user?.user_metadata?.role === 'admin';
  const navigation = getNavigation(isAdmin);

  return (
    <motion.div
      initial={{ width: isExpanded ? 280 : 80 }}
      animate={{ width: isExpanded ? 280 : 80 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        {isExpanded ? (
          <img
            className="h-8"
            src="https://monde.com.br/wp-content/uploads/2019/08/cropped-monde-logo-horizontal-centralizado-menor-1-2-300x80.png"
            alt="Monde Logo"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-indigo-600 dark:bg-blue-600" />
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          {isExpanded ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 group-hover:text-indigo-600 dark:text-gray-500 dark:group-hover:text-indigo-400'
                )}
              />
              {isExpanded && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
}