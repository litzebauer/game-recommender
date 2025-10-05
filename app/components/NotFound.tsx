import * as React from 'react';
import { useLocation } from '@tanstack/react-router';
import { BrandButton } from '@/components/BrandButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const NotFound = () => {
  const location = useLocation();

  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <Card className="w-full max-w-lg border-border bg-card text-card-foreground shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-5xl font-black text-card-foreground">404</CardTitle>
          <CardDescription className="text-lg">
            Oops! The page you're looking for couldn't be found.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>It might have been removed, renamed, or didn't exist in the first place.</p>
            <p>Let's get you back to exploring games.</p>
          </div>
          <BrandButton asChild className="rounded-xl">
            <a href="/">Return to Home</a>
          </BrandButton>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
