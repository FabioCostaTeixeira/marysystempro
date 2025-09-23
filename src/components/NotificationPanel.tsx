import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  AlertCircle, 
  Clock, 
  FileText,
  Trash2,
  CheckCheck
} from "lucide-react";
import { useState } from "react";
import { Notification } from "@/types";
import { useSupabaseData } from "@/contexts/SupabaseContext";

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onDeleteSelected: (ids: number[]) => void;
  onClose: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationPanel = ({ 
  notifications, 
  onMarkAllAsRead, 
  onDeleteSelected, 
  onClose,
  onNotificationClick
}: NotificationPanelProps) => {
  const navigate = useNavigate();
  const { payments, enrollments } = useSupabaseData();
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

  const handleSelectNotification = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, id]);
    } else {
      setSelectedNotifications(prev => prev.filter(notId => notId !== id));
    }
  };

  const handleDeleteSelected = () => {
    onDeleteSelected(selectedNotifications);
    setSelectedNotifications([]);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    onClose();
    
    if (notification.clientId) {
      if (notification.type === 'medical_certificate') {
        navigate(`/client/${notification.clientId}?tab=dados`);
      } else if (notification.type === 'overdue') {
        // Find the overdue payment to highlight it
        const overduePayment = payments.find(p => 
          p.statusPagamento === 'Atrasado' && 
          enrollments.find(e => e.id === p.id_matricula && e.id_aluno === notification.clientId)
        );
        const highlightParam = overduePayment ? `&highlight_payment=${overduePayment.id}` : '';
        navigate(`/client/${notification.clientId}?tab=financeiro${highlightParam}`);
      } else {
        navigate(`/client/${notification.clientId}`);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "overdue": return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "expiring": return <Clock className="h-4 w-4 text-warning" />;
      case "medical_certificate": return <FileText className="h-4 w-4 text-info" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "overdue": return "Atrasado";
      case "expiring": return "Expirando";
      case "medical_certificate": return "Atestado";
      default: return "Geral";
    }
  };

  return (
    <Card className="w-96 shadow-lg border-0 bg-background">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          ✕
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onMarkAllAsRead}
                className="flex-1"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
              {selectedNotifications.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir ({selectedNotifications.length})
                </Button>
              )}
            </div>
            
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/30 ${
                      notification.read 
                        ? 'bg-muted/50 opacity-75' 
                        : 'bg-background border-primary/20'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Checkbox
                      checked={selectedNotifications.includes(notification.id)}
                      onCheckedChange={(checked) => 
                        handleSelectNotification(notification.id, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getIcon(notification.type)}
                          <Badge variant="secondary" className="text-xs">
                            {getTypeLabel(notification.type)}
                          </Badge>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
};