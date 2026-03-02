import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  useNavigate,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/layout/Layout';
import MarketplacePage from './pages/MarketplacePage';
import VouchesPage from './pages/VouchesPage';
import AdminDashboard from './pages/AdminDashboard';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

// Root layout component
function RootLayout() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <Layout onLogout={handleLogout}>
      <Outlet />
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster theme="dark" position="bottom-right" />
    </Layout>
  );
}

// Route definitions
const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MarketplacePage,
});

const vouchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vouches',
  component: VouchesPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboard,
});

const routeTree = rootRoute.addChildren([indexRoute, vouchesRoute, adminRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
