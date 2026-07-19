import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
      <div className="bg-destructive/10 p-6 rounded-full mb-6 text-destructive">
        <AlertCircle className="h-16 w-16" />
      </div>
      <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
        The record or page you are looking for does not exist in the system, or you do not have permission to view it.
      </p>
      <Button asChild size="lg">
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
}