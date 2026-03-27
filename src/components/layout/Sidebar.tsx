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
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
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
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose()}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group",
                    isActive 
                      ? "bg-primary text-white" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-primary"
                  )} />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
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
              className="w-full flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
