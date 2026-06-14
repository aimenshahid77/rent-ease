import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Navbar } from './components/ui/Navbar';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleRoute } from './components/auth/RoleRoute';
import { useAuthSession } from './hooks/useAuth';

// Pages - Public
import LandingPage from './pages/LandingPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Pages - Tenant
import TenantDashboardPage from './pages/tenant/TenantDashboardPage';
import TenantProfilePage from './pages/tenant/TenantProfilePage';

// Pages - Landlord
import LandlordDashboardPage from './pages/landlord/LandlordDashboardPage';
import NewListingPage from './pages/landlord/NewListingPage';
import EditListingPage from './pages/landlord/EditListingPage';
import LandlordInquiriesPage from './pages/landlord/LandlordInquiriesPage';

// Pages - Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import { OnboardingRoute } from './components/auth/OnboardingRoute';
import { ApprovalRoute } from './components/auth/ApprovalRoute';
import { ListingAccessGuard } from './components/auth/ListingAccessGuard';
import FAQPage from './pages/FAQPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

// Layout wrapper that includes Navbar for non-auth pages
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

// Auth pages don't show Navbar
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}

function AuthSessionSync() {
  useAuthSession();
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthSessionSync />
        <Routes>
          {/* ── Public Routes (with Navbar) ── */}
          <Route
            path="/"
            element={
              <AppLayout>
                <LandingPage />
              </AppLayout>
            }
          />
          <Route
            path="/listings"
            element={
              <AppLayout>
                <ListingAccessGuard>
                  <ListingsPage />
                </ListingAccessGuard>
              </AppLayout>
            }
          />
          <Route
            path="/listings/:id"
            element={
              <AppLayout>
                <ListingAccessGuard>
                  <ListingDetailPage />
                </ListingAccessGuard>
              </AppLayout>
            }
          />
          <Route
            path="/faq"
            element={
              <AppLayout>
                <FAQPage />
              </AppLayout>
            }
          />

          {/* ── Auth Routes (no Navbar) ── */}
          <Route
            path="/login"
            element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            }
          />
          <Route
            path="/register"
            element={
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            }
          />

          {/* ── Protected Routes (requires auth) ── */}
          <Route element={<ProtectedRoute />}>
            {/* Onboarding — accessible before completing profile setup */}
            <Route
              path="/onboarding"
              element={
                <AuthLayout>
                  <OnboardingPage />
                </AuthLayout>
              }
            />

            {/* ── Tenant Routes ── */}
            <Route element={<RoleRoute allowedRoles={['tenant']} />}>
              <Route element={<OnboardingRoute />}>
                <Route element={<ApprovalRoute />}>
                  <Route
                    path="/tenant/dashboard"
                    element={
                      <AppLayout>
                        <TenantDashboardPage />
                      </AppLayout>
                    }
                  />
                  <Route
                    path="/tenant/profile"
                    element={
                      <AppLayout>
                        <TenantProfilePage />
                      </AppLayout>
                    }
                  />
                </Route>
              </Route>
            </Route>

            {/* ── Landlord Routes ── */}
            <Route element={<RoleRoute allowedRoles={['landlord']} />}>
              <Route element={<OnboardingRoute />}>
                <Route element={<ApprovalRoute />}>
                  <Route
                    path="/landlord/dashboard"
                    element={
                      <AppLayout>
                        <LandlordDashboardPage />
                      </AppLayout>
                    }
                  />
                  <Route
                    path="/landlord/listings/new"
                    element={
                      <AppLayout>
                        <NewListingPage />
                      </AppLayout>
                    }
                  />
                  <Route
                    path="/landlord/listings/:id/edit"
                    element={
                      <AppLayout>
                        <EditListingPage />
                      </AppLayout>
                    }
                  />
                  <Route
                    path="/landlord/inquiries"
                    element={
                      <AppLayout>
                        <LandlordInquiriesPage />
                      </AppLayout>
                    }
                  />
                </Route>
              </Route>
            </Route>

            {/* ── Admin Routes ── */}
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route
                path="/admin/dashboard"
                element={
                  <AppLayout>
                    <AdminDashboardPage />
                  </AppLayout>
                }
              />
            </Route>
          </Route>

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(222, 47%, 8%)',
              border: '1px solid hsl(217, 32%, 18%)',
              color: 'hsl(210, 40%, 98%)',
            },
          }}
          richColors
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
