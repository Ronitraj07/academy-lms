'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Sun, Moon, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface NavbarProps {
  onMenuClick: () => void;
  isSidebarOpen?: boolean;
  title?: string;
}

export function Navbar({ onMenuClick, isSidebarOpen, title }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar-nav"
            className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {title && (
            <div className="fade-in">
              <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-primary to-purple-600 dark:from-white dark:via-primary dark:to-purple-400">
                {title}
              </h1>
            </div>
          )}
        </div>

        {/* Center section - Search */}
        <form
          onSubmit={handleSearch}
          role="search"
          className="hidden md:block flex-1 max-w-md mx-8"
        >
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search"
              className="pl-9 bg-gray-50 dark:bg-gray-800 border-0 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            />
          </div>
        </form>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="scale-in" style={{ animationDelay: '0.1s' }}>
            <NotificationBell />
          </div>

          {/* Theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 hover:rotate-12 scale-in"
              style={{ animationDelay: '0.2s' }}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-orange-500" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-600" />
              )}
            </Button>
          )}

          {/* User avatar */}
          <div
            className="flex items-center space-x-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 cursor-pointer group scale-in"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {profile?.role || 'Student'}
              </p>
            </div>
            <div className="h-9 w-9 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-full animate-pulse opacity-0 group-hover:opacity-30 transition-opacity"></div>
              <span className="text-white text-sm font-medium relative z-10">
                {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
