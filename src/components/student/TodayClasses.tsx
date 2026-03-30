'use client';

import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TimetableEntry {
  id: string;
  subject_id: string;
  faculty_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
  subjects: { id: string; name: string; code: string };
  faculty: { id: string; full_name: string; email: string };
}

interface TodayClassesProps {
  classes: TimetableEntry[];
  currentClass?: TimetableEntry;
  nextClass?: TimetableEntry;
  loading: boolean;
}

export function TodayClasses({ classes, currentClass, nextClass, loading }: TodayClassesProps) {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Today&apos;s Classes</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-20 bg-muted rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  if (classes.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Today&apos;s Classes</h2>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No classes scheduled for today</p>
          <p className="text-sm mt-1">Enjoy your free day!</p>
        </div>
      </Card>
    );
  }

  const getClassStatus = (entry: TimetableEntry) => {
    if (entry.end_time < currentTime) return 'completed';
    if (entry.start_time <= currentTime && entry.end_time >= currentTime) return 'current';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-muted text-muted-foreground';
      case 'current':   return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'upcoming':  return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:          return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'current':   return 'Live Now';
      case 'upcoming':  return 'Upcoming';
      default:          return '';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Today&apos;s Classes</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {classes.length} {classes.length === 1 ? 'class' : 'classes'}
        </span>
      </div>

      <div className="space-y-3">
        {classes.map((entry) => {
          const status = getClassStatus(entry);
          return (
            <div
              key={entry.id}
              className={`p-4 rounded-lg border transition-all ${getStatusColor(status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-base">
                      {entry.subjects?.name || 'Unknown Subject'}
                    </h3>
                    <span className="text-sm px-2 py-1 bg-white/50 dark:bg-black/20 rounded text-xs font-medium">
                      {entry.subjects?.code}
                    </span>
                    {status !== 'completed' && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/70 dark:bg-black/30">
                        {getStatusLabel(status)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{entry.start_time} - {entry.end_time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{entry.faculty?.full_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{entry.room}</span>
                    </div>
                  </div>
                </div>
              </div>

              {status === 'current' && (
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    🎯 Class is live now! Join the session.
                  </p>
                </div>
              )}

              {status === 'upcoming' && entry === nextClass && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    ⏰ Next class — starts in {(() => {
                      const [hours, minutes] = entry.start_time.split(':').map(Number);
                      const [ch, cm] = currentTime.split(':').map(Number);
                      const diff = (hours * 60 + minutes) - (ch * 60 + cm);
                      return diff > 60 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : `${diff}m`;
                    })()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
