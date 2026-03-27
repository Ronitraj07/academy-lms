'use client';

import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, ThumbsUp, ThumbsDown, AlertCircle, User, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Remark {
  id: string;
  student_id: string;
  faculty_id: string;
  subject_id: string | null;
  content: string;
  type: 'positive' | 'negative' | 'neutral';
  is_parent_visible: boolean;
  created_at: string;
  updated_at: string;
  subjects?: {
    id: string;
    name: string;
    code: string;
  } | null;
  faculty: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface RecentRemarksProps {
  remarks: Remark[];
  loading: boolean;
}

export function RecentRemarks({ remarks, loading }: RecentRemarksProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MessageCircle className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Recent Remarks</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (remarks.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MessageCircle className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Recent Remarks</h2>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No remarks yet</p>
          <p className="text-sm mt-1">Teacher remarks will appear here</p>
        </div>
      </Card>
    );
  }

  const getRemarkIcon = (type: string) => {
    switch (type) {
      case 'positive': return <ThumbsUp className="w-4 h-4 text-green-500" />;
      case 'negative': return <ThumbsDown className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRemarkColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
      case 'negative': return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
      default: return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'positive': return 'Positive';
      case 'negative': return 'Needs Attention';
      default: return 'General';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Recent Remarks</h2>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {remarks.length} {remarks.length === 1 ? 'remark' : 'remarks'}
        </span>
      </div>

      <div className="space-y-4">
        {remarks.slice(0, 5).map((remark) => (
          <div
            key={remark.id}
            className={`p-4 rounded-lg border transition-all ${getRemarkColor(remark.type)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getRemarkIcon(remark.type)}
                <span className="text-sm font-medium">
                  {getTypeLabel(remark.type)}
                </span>
                {remark.is_parent_visible && (
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                    Parent Visible
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(remark.created_at), { addSuffix: true })}
              </span>
            </div>

            <p className="text-sm mb-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              {remark.content}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{remark.faculty.full_name}</span>
                </div>
                
                {remark.subjects && (
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{remark.subjects.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {remarks.length > 5 && (
          <div className="text-center pt-4">
            <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium">
              View all {remarks.length} remarks →
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}