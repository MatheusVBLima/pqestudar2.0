import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSavedTools } from "@/hooks/useSavedTools";
import { cn } from "@/lib/utils";

interface SaveToolButtonProps {
  toolId: string;
  toolName: string;
  className?: string;
}

export function SaveToolButton({ toolId, toolName, className }: SaveToolButtonProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSaved, toggleSave, isToggling } = useSavedTools();

  const saved = isSaved(toolId);
  const toggling = isToggling(toolId);

  const handleClick = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate("/login");
      return;
    }

    await toggleSave(toolId);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={toggling}
      className={cn(
        "gap-1.5 transition-colors",
        saved 
          ? "text-primary hover:text-primary/80" 
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      aria-label={saved ? "Remover dos salvos" : "Salvar ferramenta"}
      title={saved ? "Remover dos salvos" : "Salvar ferramenta"}
    >
      <Bookmark 
        className={cn(
          "h-4 w-4 transition-all",
          saved && "fill-current"
        )} 
      />
      <span className="text-xs font-medium">
        {toggling ? "..." : saved ? "Salvo" : "Salvar"}
      </span>
    </Button>
  );
}
