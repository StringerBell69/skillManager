import { lazy, Suspense, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import PricingPage from "./pages/Pricing";
import { Spinner } from "./components/ui/spinner";

// Only the public pages are eager: they are prerendered and must stay light.
// Clerk, React Query, and every signed-in screen load on demand.
const AuthLayout = lazy(() => import("./layouts/AuthLayout"));
const AppShell = lazy(() => import("./components/layout/AppShell"));
const Login = lazy(() => import("./pages/Login"));
const SignUpPage = lazy(() => import("./pages/SignUp"));
const CliAuth = lazy(() => import("./pages/Cli"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Agents = lazy(() => import("./pages/Agents"));
const Devices = lazy(() => import("./pages/Devices"));
const Billing = lazy(() => import("./pages/Billing"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
      <Spinner className="size-5" label="Loading page" />
    </div>
  );
}

function Page({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<PricingPage />} />

      <Route
        element={
          <Suspense fallback={null}>
            <AuthLayout />
          </Suspense>
        }
      >
        {/* Clerk path routing renders nested steps (factor-one, sso-callback) under these paths. */}
        <Route path="/login/*" element={<Login />} />
        <Route path="/signup/*" element={<SignUpPage />} />
        <Route path="/cli" element={<CliAuth />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Page><Dashboard /></Page>} />
          <Route path="/agents" element={<Page><Agents /></Page>} />
          <Route path="/devices" element={<Page><Devices /></Page>} />
          <Route path="/billing" element={<Page><Billing /></Page>} />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Suspense fallback={null}>
            <NotFound />
          </Suspense>
        }
      />
    </Routes>
  );
}
