import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { ClientList } from "@/components/ClientList";
import { EnrollmentList } from "@/components/EnrollmentList";
import { PaymentManagement } from "@/components/PaymentManagement";
import { Reports } from "@/pages/Reports";
import { ClientProfile } from "@/pages/ClientProfile";

const queryClient = new QueryClient();

const App = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

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
      <TooltipProvider>
        <Router>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/client/:id" element={<ClientProfile />} />
            <Route path="*" element={
              <div className="min-h-screen bg-background">
                <Header title="PersonalSystem Pro" />
                <div className="flex">
                  <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
                  <main className="flex-1 p-6">
                    {renderContent()}
                  </main>
                </div>
              </div>
            } />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
