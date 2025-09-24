import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Users, AlertTriangle } from "lucide-react";
import { ClientForm } from "./ClientForm";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useSupabaseData } from "@/contexts/SupabaseContext";
import { Client } from "@/types";

export const ClientList = () => {
  const navigate = useNavigate();
  const { clients, addClient, loading, error } = useSupabaseData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "Todos" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleClientClick = (client: Client) => {
    navigate(`/client/${client.id}`);
  };

  const handleNewClient = () => {
    setIsFormOpen(true);
  };

  const handleSaveNewClient = (newClientData) => {
    addClient(newClientData);
  };

  // Check if client needs medical certificate (age > 40 and no certificate)
  const needsMedicalCertificate = (client: Client) => {
    if (!client.dataNascimento) return false;
    const birthDate = new Date(client.dataNascimento);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return (age - 1) > 40 && (!client.atestadoMedico || client.atestadoMedico === '');
    }
    
    return age > 40 && (!client.atestadoMedico || client.atestadoMedico === '');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <h2 className="text-2xl font-bold">Alunos</h2>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
          <LoadingSkeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="shadow-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <LoadingSkeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <LoadingSkeleton className="h-5 w-32 mb-2" />
                    <LoadingSkeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <LoadingSkeleton className="h-4 w-full" />
                <LoadingSkeleton className="h-4 w-full" />
                <LoadingSkeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <h2 className="text-2xl font-bold">Alunos</h2>
            <p className="text-muted-foreground">Erro ao carregar dados</p>
          </div>
        </div>
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alunos</h2>
          <p className="text-muted-foreground">Gerencie seus alunos e suas informações</p>
        </div>
        <Button onClick={handleNewClient} className="gradient-primary text-primary-foreground shadow-primary">
          <Plus className="h-4 w-4 mr-2" />
          Novo Aluno
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={statusFilter === "Todos" ? "default" : "outline"}
                onClick={() => setStatusFilter("Todos")}
                size="sm"
              >
                Todos
              </Button>
              <Button 
                variant={statusFilter === "Ativo" ? "default" : "outline"}
                onClick={() => setStatusFilter("Ativo")}
                size="sm"
              >
                Ativos
              </Button>
              <Button 
                variant={statusFilter === "Inativo" ? "outline" : "outline"}
                onClick={() => setStatusFilter("Inativo")}
                size="sm"
              >
                Inativos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredClients.map((client) => (
        <Card 
          key={client.id} 
          className={`shadow-card transition-smooth hover:shadow-primary cursor-pointer ${
            needsMedicalCertificate(client) ? 'border-warning border-2' : ''
          }`}
          onClick={() => handleClientClick(client)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={client.foto} alt={client.nome} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {client.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{client.nome}</CardTitle>
                  {needsMedicalCertificate(client) && (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  )}
                </div>
                <div className="flex gap-2 mt-1">
                  <Badge 
                    variant={client.status === "Ativo" ? "default" : "secondary"}
                    className={client.status === "Ativo" ? "bg-success text-success-foreground" : ""}
                  >
                    {client.status}
                  </Badge>
                  {needsMedicalCertificate(client) && (
                    <Badge variant="outline" className="text-warning border-warning">
                      Atestado Pendente
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {client.telefone && (
                  <a
                    href={`https://wa.me/55${client.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title="Enviar mensagem no WhatsApp"
                  >
                    <Button variant="ghost" size="icon" className="h-16 w-16">
                      <img src="/icones/whatsapp-icon.png" alt="WhatsApp" className="h-10 w-10" />
                    </Button>
                  </a>
                )}
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    onClick={(e) => e.stopPropagation()}
                    title="Enviar E-mail"
                  >
                    <Button variant="ghost" size="icon" className="h-16 w-16">
                      <img src="/icones/email icon.png" alt="E-mail" className="h-10 w-10" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium text-foreground">Objetivos:</p>
                <p className="text-muted-foreground">{client.objetivos}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum aluno encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "Todos" 
                ? "Tente ajustar os filtros de busca."
                : "Comece adicionando seu primeiro aluno."
              }
            </p>
            {!searchTerm && statusFilter === "Todos" && (
              <Button onClick={handleNewClient} className="gradient-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Aluno
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ClientForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveNewClient}
      />
    </div>
  );
};