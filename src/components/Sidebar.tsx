import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  CreditCard, 
  FileText,
  TrendingUp
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clients", label: "Alunos", icon: Users },
  { id: "enrollment", label: "Matrículas", icon: UserPlus },
  { id: "payments", label: "Contas a Receber", icon: CreditCard },
  { id: "reports", label: "Relatórios", icon: TrendingUp },
];

export const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  return (
    <aside className="w-64 bg-card border-r border-border shadow-card">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 transition-smooth",
                isActive && "gradient-primary text-primary-foreground shadow-primary"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
};