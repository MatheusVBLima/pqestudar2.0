import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PageSettings {
  id: string;
  route: string;
  title_tag: string;
  meta_description: string;
  header_title: string;
  header_description: string;
  created_at: string;
  updated_at: string;
}

const FALLBACK: Omit<PageSettings, "id" | "route" | "created_at" | "updated_at"> = {
  title_tag: "PqEstudar",
  meta_description: "Oportunidades educacionais e ferramentas úteis.",
  header_title: "PqEstudar",
  header_description: "Conteúdo organizado para você evoluir mais rápido.",
};

const MANAGED_ROUTES = [
  "/ferramentas",
  "/concursos",
  "/votacoes",
  "/ferramentas/salvos",
  "/premium",
  "/privacidade",
  "/termos",
] as const;

export type ManagedRoute = (typeof MANAGED_ROUTES)[number];

export function isManagedRoute(route: string): route is ManagedRoute {
  return MANAGED_ROUTES.includes(route as ManagedRoute);
}

export { MANAGED_ROUTES };

// ─── Single route hook (for pages) ───
export function usePageSettings(route: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["page_settings", route],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_settings" as any)
        .select("*")
        .eq("route", route)
        .maybeSingle();

      if (error) {
        console.error(`[PageSettings] Error loading settings for ${route}:`, error.message);
        return null;
      }
      return data as unknown as PageSettings | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const settings = data
    ? (data as PageSettings)
    : null;

  return {
    titleTag: settings?.title_tag ?? FALLBACK.title_tag,
    metaDescription: settings?.meta_description ?? FALLBACK.meta_description,
    headerTitle: settings?.header_title ?? FALLBACK.header_title,
    headerDescription: settings?.header_description ?? FALLBACK.header_description,
    isLoading,
    raw: settings,
  };
}

// ─── All routes hook (for admin) ───
export function useAllPageSettings() {
  const queryClient = useQueryClient();

  const { data: allSettings, isLoading } = useQuery({
    queryKey: ["page_settings", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_settings" as any)
        .select("*")
        .order("route");

      if (error) {
        console.error("[PageSettings] Error loading all settings:", error.message);
        return [];
      }
      return (data ?? []) as unknown as PageSettings[];
    },
    staleTime: 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Pick<PageSettings, "route" | "title_tag" | "meta_description" | "header_title" | "header_description">) => {
      const { error } = await supabase
        .from("page_settings" as any)
        .update({
          title_tag: updates.title_tag,
          meta_description: updates.meta_description,
          header_title: updates.header_title,
          header_description: updates.header_description,
        })
        .eq("route", updates.route);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["page_settings"] });
    },
  });

  return {
    allSettings: allSettings ?? [],
    isLoading,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
