import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import SiteLayout from './components/SiteLayout';
import CustomerViewPage from './pages/CustomerViewPage';
import UploadSectionPage from './pages/UploadSectionPage';
import AdminPanelPage from './pages/AdminPanelPage';
import AdminTokenGate from './components/AdminTokenGate';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const rootRoute = createRootRoute({
  component: SiteLayout,
});

const customerViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: CustomerViewPage,
});

const uploadSectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload',
  component: UploadSectionPage,
});

const adminPanelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AdminTokenGate>
      <AdminPanelPage />
    </AdminTokenGate>
  ),
});

const routeTree = rootRoute.addChildren([
  customerViewRoute,
  uploadSectionRoute,
  adminPanelRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
