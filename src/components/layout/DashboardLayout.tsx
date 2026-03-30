'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar  = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <a href="#main-content" className="skip-to-main">Skip to main content</a>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar — visible from md (768px) upwards */}
        <div className="hidden md:block md:w-64 lg:w-72 flex-shrink-0" role="complementary" aria-label="Sidebar navigation">
          <Sidebar isOpen={true} onClose={closeSidebar} />
        </div>

        {/* Mobile overlay sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar onMenuClick={toggleSidebar} isSidebarOpen={sidebarOpen} title={title} />

          <main id="main-content" className="flex-1 overflow-y-auto" role="main" aria-label="Main content">
            <div className="p-4 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
