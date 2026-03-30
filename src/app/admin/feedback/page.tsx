'use client';

import { FileText, MessageSquareDashed, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminFeedbackPage() {
  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gradient">Feedback</h1>
        <p className="text-muted-foreground">
          Review feedback submitted by students and faculty
        </p>
      </div>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Feedback Inbox
            <Badge variant="secondary" className="ml-2 text-xs">
              <Clock className="h-3 w-3 mr-1" />Coming Soon
            </Badge>
          </CardTitle>
          <CardDescription>
            Platform-wide feedback collection is being built. Check back soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <MessageSquareDashed className="h-16 w-16 mb-4 opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
            <p className="text-sm max-w-sm">
              Once feedback forms are enabled, all submissions from students and faculty
              will appear here for review and action.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
