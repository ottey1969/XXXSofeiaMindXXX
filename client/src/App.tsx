import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Chat from "@/pages/chat";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import AdminPanel from "@/pages/AdminPanel";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import CookiePolicy from "@/pages/CookiePolicy";
import GDPRCompliance from "@/pages/GDPRCompliance";
import EmailVerify from "@/pages/EmailVerify";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Landing />
      </Route>
      <Route path="/chat/:id?">
        <Chat />
      </Route>
      <Route path="/sofeiaai">
        <Chat />
      </Route>
      <Route path="/admin">
        <AdminPanel />
      </Route>
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/cookies" component={CookiePolicy} />
      <Route path="/gdpr" component={GDPRCompliance} />
      <Route path="/verify" component={EmailVerify} />
      <Route path="/logout">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
            <p>You will be redirected to the home page.</p>
          </div>
        </div>
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
