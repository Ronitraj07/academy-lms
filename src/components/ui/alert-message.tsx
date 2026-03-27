import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertMessageProps {
  type?: 'error' | 'warning' | 'success' | 'info';
  title?: string;
  message: string;
  className?: string;
}

const alertConfig = {
  error: {
    icon: XCircle,
    bgClass: 'bg-red-50 dark:bg-red-900/20',
    borderClass: 'border-red-200 dark:border-red-800',
    iconClass: 'text-red-600 dark:text-red-400',
    titleClass: 'text-red-900 dark:text-red-200',
    textClass: 'text-red-800 dark:text-red-300',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderClass: 'border-yellow-200 dark:border-yellow-800',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
    titleClass: 'text-yellow-900 dark:text-yellow-200',
    textClass: 'text-yellow-800 dark:text-yellow-300',
  },
  success: {
    icon: CheckCircle2,
    bgClass: 'bg-green-50 dark:bg-green-900/20',
    borderClass: 'border-green-200 dark:border-green-800',
    iconClass: 'text-green-600 dark:text-green-400',
    titleClass: 'text-green-900 dark:text-green-200',
    textClass: 'text-green-800 dark:text-green-300',
  },
  info: {
    icon: Info,
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    borderClass: 'border-blue-200 dark:border-blue-800',
    iconClass: 'text-blue-600 dark:text-blue-400',
    titleClass: 'text-blue-900 dark:text-blue-200',
    textClass: 'text-blue-800 dark:text-blue-300',
  },
};

export function AlertMessage({
  type = 'info',
  title,
  message,
  className,
}: AlertMessageProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border p-4',
        config.bgClass,
        config.borderClass,
        className
      )}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconClass)} aria-hidden="true" />
      <div className="flex-1">
        {title && (
          <h4 className={cn('font-semibold mb-1', config.titleClass)}>
            {title}
          </h4>
        )}
        <p className={cn('text-sm', config.textClass)}>{message}</p>
      </div>
    </div>
  );
}
