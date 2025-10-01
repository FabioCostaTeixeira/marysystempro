
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PortalPage = () => {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao Portal do Aluno!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Este é o seu espaço exclusivo para acompanhar seus treinos, pagamentos e evolução.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalPage;
