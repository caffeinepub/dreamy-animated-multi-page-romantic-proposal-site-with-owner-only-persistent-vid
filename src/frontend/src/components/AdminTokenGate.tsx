import { ReactNode } from 'react';
import { useAdminToken } from '@/hooks/useAdminToken';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

interface AdminTokenGateProps {
  children: ReactNode;
}

export default function AdminTokenGate({ children }: AdminTokenGateProps) {
  const { isAdmin, isChecking } = useAdminToken();

  if (isChecking) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">Checking authorization...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 text-red-600" />
                <div>
                  <CardTitle className="text-red-900">Access Denied</CardTitle>
                  <CardDescription className="text-red-700">
                    You do not have permission to access this page
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                This page requires admin authorization. Please contact the administrator if you believe you should have access.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
