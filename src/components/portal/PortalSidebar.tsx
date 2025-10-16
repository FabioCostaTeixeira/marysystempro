import { Link, useLocation } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  UserCircle, 
  CalendarCheck, 
  DollarSign
} from "lucide-react";

const menuItems = [
  { id: "dashboard", path: "/portal_aluno", label: "Dashboard", icon: LayoutDashboard },
  { id: "dados", path: "/portal_aluno/dados", label: "Meus Dados", icon: UserCircle },
  { id: "frequencia", path: "/portal_aluno/frequencia", label: "Minha Frequência", icon: CalendarCheck },
  { id: "mensalidades", path: "/portal_aluno/mensalidades", label: "Financeiro", icon: DollarSign },
];

export const PortalSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border shadow-card">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Match parent and exact paths for dashboard
          const isActive = item.path === "/portal_aluno" 
            ? location.pathname === item.path 
            : location.pathname.startsWith(item.path);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                buttonVariants({ variant: isActive ? "default" : "ghost" }),
                "w-full justify-start gap-3 transition-smooth",
                isActive && "gradient-primary text-primary-foreground shadow-primary"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};