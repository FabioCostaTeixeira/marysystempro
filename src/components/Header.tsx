import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Settings } from "lucide-react";
import { useState } from "react";
import maryLogo from "@/assets/mary-personal-logo.jpg";
import { NotificationPanel } from "@/components/NotificationPanel";
import { useSupabaseData } from "@/contexts/SupabaseContext";

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { notifications, markAllNotificationsAsRead, deleteSelectedNotifications } = useSupabaseData();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
  };

  const handleDeleteSelected = (ids: number[]) => {
    deleteSelectedNotifications(ids);
  };

  return (
    <header className="bg-card border-b border-border shadow-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
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
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-primary text-primary-foreground">MP</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};