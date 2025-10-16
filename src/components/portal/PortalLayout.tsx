import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const PortalLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Portal do Aluno" onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <div className="flex">
        <div className="hidden md:block">
          <PortalSidebar />
        </div>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-card border-r border-border shadow-card">
          <PortalSidebar />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PortalLayout;