import * as React from 'react';
import { useLocation } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const NotFound = () => {
  const location = useLocation();

  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <Card className="w-full max-w-lg border-white/10 bg-white/5 text-white shadow-2xl backdrop-blur">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-5xl font-black text-white">404</CardTitle>
          <CardDescription className="text-lg text-slate-200">
            Oops! The page you're looking for couldn't be found.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2 text-sm text-slate-300">
            <p>It might have been removed, renamed, or didn't exist in the first place.</p>
            <p>Let's get you back to exploring games.</p>
          </div>
          <Button
            asChild
            className="rounded-xl border-0 bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg transition-transform hover:scale-105 hover:from-blue-700 hover:to-teal-700"
          >
            <a href="/">Return to Home</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
