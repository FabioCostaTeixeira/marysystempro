import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  currentImage: string;
  onImageChange: (imageUrl: string) => void;
  altText: string;
  className?: string;
}

export const ImageUploader = ({ currentImage, onImageChange, altText, className = "" }: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageChange(result);
      setIsUploading(false);
      toast({
        title: "Sucesso",
        description: "Foto carregada com sucesso!",
      });
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Erro",
        description: "Erro ao carregar a imagem. Tente novamente.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    onImageChange('/placeholder.svg');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={currentImage} alt={altText} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
            <Camera className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        
        {currentImage !== '/placeholder.svg' && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemoveImage}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? "Carregando..." : "Escolher Foto"}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};