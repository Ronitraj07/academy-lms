'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  GraduationCap,
  User,
  ClipboardList,
  MessageSquare,
  UserCheck,
  FileText,
  Bell,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  roles?: ('student' | 'faculty' | 'admin')[];
}

const navigation: NavItem[] = [
  // Student Navigation
  {
    title: 'Dashboard',
    href: '/student',
    icon: Home,
    roles: ['student']
  },
  {
    title: 'Attendance',
    href: '/student/attendance',
    icon: UserCheck,
    roles: ['student']
  },
  {
    title: 'Timetable',
    href: '/student/timetable',
    icon: Calendar,
    roles: ['student']
  },
  {
    title: 'Remarks',
    href: '/student/remarks',
    icon: MessageSquare,
    roles: ['student']
  },
  {
    title: 'Subjects',
    href: '/student/subjects',
    icon: BookOpen,
    roles: ['student']
  },

  // Faculty Navigation
  {
    title: 'Dashboard',
    href: '/faculty',
    icon: Home,
    roles: ['faculty']
  },
  {
    title: 'My Subjects',
    href: '/faculty/subjects',
    icon: BookOpen,
    roles: ['faculty']
  },
  {
    title: 'Attendance',
    href: '/faculty/attendance',
    icon: ClipboardList,
    roles: ['faculty']
  },
  {
    title: 'Students',
    href: '/faculty/students',
    icon: Users,
    roles: ['faculty']
  },
  {
    title: 'Timetable',
    href: '/faculty/timetable',
    icon: Calendar,
    roles: ['faculty']
  },
  {
    title: 'Remarks',
    href: '/faculty/remarks',
    icon: MessageSquare,
    roles: ['faculty']
  },
  {
    title: 'Analytics',
    href: '/faculty/analytics',
    icon: BarChart3,
    roles: ['faculty']
  },

  // Admin Navigation
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home,
    roles: ['admin']
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    roles: ['admin', 'faculty', 'student']
  },
  {
    title: 'Send Notification',
    href: '/notifications/send',
    icon: Send,
    roles: ['admin', 'faculty']
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    roles: ['admin']
  },
  {
    title: 'Students',
    href: '/admin/students',
    icon: GraduationCap,
    roles: ['admin']
  },
  {
    title: 'Faculty',
    href: '/admin/faculty',
    icon: User,
    roles: ['admin']
  },
  {
    title: 'Subjects',
    href: '/admin/subjects',
    icon: BookOpen,
    roles: ['admin']
  },
  {
    title: 'Enrollments',
    href: '/admin/enrollments',
    icon: ClipboardList,
    roles: ['admin']
  },
  {
    title: 'Attendance',
    href: '/admin/attendance',
    icon: UserCheck,
    roles: ['admin']
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    roles: ['admin']
  },
  {
    title: 'Feedback',
    href: '/admin/feedback',
    icon: FileText,
    roles: ['admin']
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    roles: ['admin']
  }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const userRole = profile?.role || 'student';
  const filteredNavigation = navigation.filter(item => 
    item.roles?.includes(userRole)
  );

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-xl lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-lg relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-lg animate-pulse opacity-50"></div>
                <GraduationCap className="h-5 w-5 text-white relative z-10" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Academy LMS
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {userRole} Portal
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-modern">
            {filteredNavigation.map((item, index) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose()}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden fade-in",
                    isActive
                      ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/30"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md"
                  )}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {/* Animated background for hover */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  )}

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                  )}

                  <item.icon className={cn(
                    "h-5 w-5 transition-all duration-300 relative z-10",
                    isActive
                      ? "text-white"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-primary group-hover:scale-110"
                  )} />
                  <span className="font-medium relative z-10">{item.title}</span>

                  {/* Hover arrow */}
                  {!isActive && (
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 relative z-10">
                      <svg className="w-4 h-4 text-primary" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gradient-to-r from-gray-50/50 to-primary/5 dark:from-gray-800/50 dark:to-primary/5">
            <div className="flex items-center space-x-3 mb-4 p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-md relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-full animate-pulse opacity-30"></div>
                <span className="text-white text-sm font-medium relative z-10">
                  {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {userRole}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-700 transition-all duration-300 group"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
