import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Chat from "@/pages/chat";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import AdminPanel from "@/pages/AdminPanel";
import { useAuth } from "@/hooks/useAuth";

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <AuthWrapper>
          <Chat />
        </AuthWrapper>
      </Route>
      <Route path="/chat/:id?">
        <AuthWrapper>
          <Chat />
        </AuthWrapper>
      </Route>
      <Route path="/admin">
        <AdminPanel />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
