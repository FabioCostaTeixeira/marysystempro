import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, Menu, LogOut, User, Mail, Phone, Calendar as CalendarIcon } from "lucide-react";
import maryLogo from "@/assets/mary-personal-logo.jpg";
import { NotificationPanel } from "@/components/NotificationPanel";
import { useSupabaseData } from "@/contexts/SupabaseContext";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface HeaderProps {
  title: string;
  onMobileMenuToggle: () => void;
}

export const Header = ({ title, onMobileMenuToggle }: HeaderProps) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { supabase, notifications, markAllNotificationsAsRead, deleteSelectedNotifications } = useSupabaseData();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
  };

  const handleDeleteSelected = (ids: number[]) => {
    deleteSelectedNotifications(ids);
  };

  const formatJoinDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `Há ${diffDays} dias`;
  };

  return (
    <header className="bg-card border-b border-border shadow-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onMobileMenuToggle}>
              <Menu className="h-6 w-6" />
            </Button>
            <img 
              src={maryLogo} 
              alt="Mary Personal" 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">Seja sua melhor versão</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <NotificationPanel
                  notifications={notifications}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDeleteSelected={handleDeleteSelected}
                  onClose={() => setIsNotificationOpen(false)}
                />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || "Usuário"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  <span>{user?.phone || "(xx) xxxxx-xxxx"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-muted-foreground">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>Cadastro: {formatJoinDate(user?.created_at)}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:bg-red-500/10 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};