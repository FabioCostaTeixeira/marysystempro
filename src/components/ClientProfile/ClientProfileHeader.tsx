import { memo, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Repeat, Mail } from "lucide-react";
import { Client, Enrollment } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ClientProfileHeaderProps {
  client: Client;
  enrollments: Enrollment[];
  needsMedicalCertificate: boolean;
  onInvite: () => void;
  isInviting: boolean;
}

export const ClientProfileHeader = memo(({ 
  client, 
  enrollments,
  needsMedicalCertificate,
  onInvite,
  isInviting
}: ClientProfileHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPortalView = location.pathname.startsWith('/portal_aluno');

  const activeEnrollment = useMemo(() => {
    return enrollments
      .filter(e => e.statusMatricula === 'Ativa')
      .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())[0];
  }, [enrollments]);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4">
        {!isPortalView && (
          <Button 
            variant="outline" 
            onClick={() => navigate('/clients')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold">Perfil do Aluno</h1>
          <p className="text-muted-foreground">Informações completas de {client.nome}</p>
        </div>
      </div>

      {/* Client Info Card */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full">
              <Avatar className="h-20 w-20">
                <AvatarImage src={client.foto} alt={client.nome} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {client.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold">{client.nome}</h2>
                {activeEnrollment && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Repeat className="h-4 w-4" />
                    <span>{activeEnrollment.frequenciaSemanal}x por semana</span>
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <Badge 
                    variant={client.status === "Ativo" ? "default" : "secondary"}
                    className={client.status === "Ativo" ? "bg-success text-success-foreground" : ""}
                  >
                    {client.status}
                  </Badge>
                  {needsMedicalCertificate && (
                    <Badge variant="outline" className="text-warning border-warning">
                      Atestado Pendente
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {!client.user_id && (
              <Button onClick={onInvite} disabled={isInviting} className="gradient-primary text-primary-foreground shadow-primary w-full sm:w-auto">
                {isInviting ? (
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Convidar para o Portal
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
});

ClientProfileHeader.displayName = "ClientProfileHeader";