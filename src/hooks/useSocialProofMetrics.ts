import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SocialProofMetrics {
  usersCount: number | null;
  toolsCount: number | null;
  contestsCount: number | null;
  newsletterCount: number | null;
  isLoading: boolean;
}

export function useSocialProofMetrics(): SocialProofMetrics {
  const { data: toolsCount, isLoading: loadingTools } = useQuery({
    queryKey: ["metrics-tools-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("tools_public")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: contestsCount, isLoading: loadingContests } = useQuery({
    queryKey: ["metrics-contests-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("oportunidades_public")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count;
    },
    staleTime: 1000 * 60 * 10,
  });

  // TODO: conectar fonte real de usuários (profiles table ou RPC segura)
  // Não há view pública de perfis exposta no momento; fallback null → exibe "—"
  const usersCount = null;

  // TODO: conectar fonte real de newsletter (Brevo API ou RPC segura)
  // A tabela newsletter_subscribers não tem SELECT público; fallback null → exibe "—"
  const newsletterCount = null;

  return {
    usersCount,
    toolsCount: toolsCount ?? null,
    contestsCount: contestsCount ?? null,
    newsletterCount,
    isLoading: loadingTools || loadingContests,
  };
}
