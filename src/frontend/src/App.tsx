import { createRouter, createRoute, createRootRoute, RouterProvider } from '@tanstack/react-router';
import SiteLayout from './components/SiteLayout';
import CustomerViewPage from './pages/CustomerViewPage';
import UploadSectionPage from './pages/UploadSectionPage';
import LiveListCheckerPage from './pages/LiveListCheckerPage';
import AdminPanelPage from './pages/AdminPanelPage';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQuery } from '@tanstack/react-query';
import { useActor } from './hooks/useActor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Loader2 } from 'lucide-react';

// Admin gate component
function AdminGate({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
  });

  if (isInitializing || isLoading || isFetching) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="bg-white border-sand-200">
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-amber-600" />
              <p className="text-sand-600">Checking authorization...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!identity || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="border-red-200 bg-white">
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
              <p className="text-sand-600">
                This page requires admin authorization. Please log in with an admin account.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Define routes
const rootRoute = createRootRoute({
  component: SiteLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: CustomerViewPage,
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload',
  component: UploadSectionPage,
});

const liveListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/live-list',
  component: LiveListCheckerPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AdminGate>
      <AdminPanelPage />
    </AdminGate>
  ),
});

// Create router
const routeTree = rootRoute.addChildren([
  indexRoute,
  uploadRoute,
  liveListRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
  return <RouterProvider router={router} />;
}
