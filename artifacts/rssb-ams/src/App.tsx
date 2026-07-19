import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Layout } from '@/components/layout/Layout';

import Login from '@/pages/login';
import Dashboard from '@/pages/dashboard';
import Applicants from '@/pages/applicants/index';
import AddApplicant from '@/pages/applicants/add';
import ViewApplicant from '@/pages/applicants/view';
import Reports from '@/pages/reports';
import Export from '@/pages/export';
import Backup from '@/pages/backup';
import Admins from '@/pages/admins';
import Settings from '@/pages/settings';
import About from '@/pages/about';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: any }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) return null;
  if (!user) return null;

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (user) setLocation("/dashboard");
      else setLocation("/login");
    }
  }, [user, loading, setLocation]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path="/login" component={Login} />
      
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/applicants"><ProtectedRoute component={Applicants} /></Route>
      <Route path="/applicants/add"><ProtectedRoute component={AddApplicant} /></Route>
      <Route path="/applicants/:id"><ProtectedRoute component={ViewApplicant} /></Route>
      
      <Route path="/reports"><ProtectedRoute component={Reports} /></Route>
      <Route path="/export"><ProtectedRoute component={Export} /></Route>
      <Route path="/backup"><ProtectedRoute component={Backup} /></Route>
      <Route path="/admins"><ProtectedRoute component={Admins} /></Route>
      <Route path="/settings"><ProtectedRoute component={Settings} /></Route>
      <Route path="/about"><ProtectedRoute component={About} /></Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

// Resolve the correct router base:
//  - Electron production builds use './' as vite base → file:// protocol needs empty base
//  - Replit web preview uses BASE_PATH (e.g. '/rssb-ams/') → strip trailing slash
const rawBase = import.meta.env.BASE_URL || '/';
const routerBase = (rawBase === './' || rawBase === '.') ? '' : rawBase.replace(/\/$/, '');

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={routerBase}>
          <Router />
        </WouterRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
