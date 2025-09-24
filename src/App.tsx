import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SupabaseProvider } from "@/contexts/SupabaseContext";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { ClientList } from "@/components/ClientList";
import { EnrollmentList } from "@/components/EnrollmentList";
import { PaymentManagement } from "@/components/PaymentManagement";
import { Reports } from "@/pages/Reports";
import { ClientProfile } from "@/pages/ClientProfile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const queryClient = new QueryClient();

const App = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "clients":
        return <ClientList />;
      case "enrollment":
        return <EnrollmentList />;
      case "payments":
        return <PaymentManagement />;
      case "reports":
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <TooltipProvider>
          <Router>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/client/:id" element={<ClientProfile />} />
              <Route path="*" element={
                <div className="min-h-screen bg-background">
                  <Header title="PersonalSystem Pro" onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                  <div className="flex">
                    <div className="hidden md:block">
                      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
                    </div>
                    <main className="flex-1 p-6">
                      {renderContent()}
                    </main>
                  </div>
                  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetContent side="left" className="p-0 w-64 bg-card border-r border-border shadow-card">
                      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
                    </SheetContent>
                  </Sheet>
                </div>
              } />
            </Routes>
            {showBackToTop && (
              <Button
                onClick={scrollToTop}
                className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg gradient-primary text-primary-foreground z-50 transition-opacity duration-300"
                size="icon"
              >
                <ArrowUp className="h-6 w-6" />
              </Button>
            )}
          </Router>
        </TooltipProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  );
};

export default App;
