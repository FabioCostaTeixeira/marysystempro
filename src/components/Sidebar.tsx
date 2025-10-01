import { Link, useLocation } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  CreditCard, 
  FileText,
  TrendingUp
} from "lucide-react";

const menuItems = [
  { id: "dashboard", path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clients", path: "/clients", label: "Alunos", icon: Users },
  { id: "enrollment", path: "/enrollments", label: "Matrículas", icon: UserPlus },
  { id: "payments", path: "/payments", label: "Contas a Receber", icon: CreditCard },
  { id: "reports", path: "/reports", label: "Relatórios", icon: TrendingUp },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border shadow-card">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
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