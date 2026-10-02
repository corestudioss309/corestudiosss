import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Subscribe from "./pages/Subscribe";
import Renew from "./pages/Renew";
import Work from "./pages/Work";
import NotFound from "./pages/NotFound";
import ScrollToTop from "@/components/ScrollToTop";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import CoreCursor from "@/components/CoreCursor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CoreCursor />
        <BrowserRouter>
          <ScrollToTop />
          <WhatsAppFloatingButton />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/renew" element={<Renew />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/work" element={<Work />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
