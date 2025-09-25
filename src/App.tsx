import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import LookerDashboard from "@/components/ui/LookerDashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { handleAuthCallback } from "./lib/powerbi";
import { loadRealDatasets } from "./lib/real-datasets";
import { useToast } from "./hooks/use-toast";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");

    if (error) {
      toast({
        title: "Authentication Failed",
        description: `Power BI authentication error: ${error}`,
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && state === "powerbi_auth") {
      const codeVerifier = sessionStorage.getItem("powerbi_code_verifier");
      if (codeVerifier) {
        handleAuthCallback(code, codeVerifier)
          .then(async () => {
            toast({
              title: "Connected to Power BI",
              description: "Successfully authenticated with Power BI.",
            });
            await loadRealDatasets();
            window.history.replaceState({}, document.title, window.location.pathname);
            sessionStorage.removeItem("powerbi_code_verifier");
            window.location.reload();
          })
          .catch((err) => {
            toast({
              title: "Authentication Failed",
              description: "Failed to complete Power BI authentication.",
              variant: "destructive",
            });
            console.error("Auth callback error:", err);
            window.history.replaceState({}, document.title, window.location.pathname);
            sessionStorage.removeItem("powerbi_code_verifier");
          });
      }
    }
  }, [toast]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<LookerDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
