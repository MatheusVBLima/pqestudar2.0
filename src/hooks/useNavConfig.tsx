import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string | null;
  order_index: number;
  is_active: boolean;
  is_external: boolean;
  open_in_new_tab: boolean;
}

export interface NavSettings {
  id: string;
  logo_light_url: string;
  logo_dark_url: string;
}

const FALLBACK_ITEMS: NavItem[] = [
  { id: "fb-1", label: "Início", href: "/", icon: "home", order_index: 0, is_active: true, is_external: false, open_in_new_tab: false },
  { id: "fb-2", label: "Ferramentas", href: "/ferramentas", icon: "wrench", order_index: 1, is_active: true, is_external: false, open_in_new_tab: false },
  { id: "fb-3", label: "Concursos", href: "/concursos", icon: "scroll-text", order_index: 2, is_active: true, is_external: false, open_in_new_tab: false },
  { id: "fb-4", label: "Produtos", href: "/produtos", icon: "shopping-bag", order_index: 3, is_active: true, is_external: false, open_in_new_tab: false },
  { id: "fb-5", label: "Votações", href: "/votacoes", icon: "vote", order_index: 4, is_active: true, is_external: false, open_in_new_tab: false },
  { id: "fb-6", label: "Sobre", href: "/sobre", icon: "info", order_index: 5, is_active: true, is_external: false, open_in_new_tab: false },
];

const FALLBACK_SETTINGS: NavSettings = {
  id: "fallback",
  logo_light_url: "",
  logo_dark_url: "",
};

export function useNavConfig() {
  const itemsQuery = useQuery({
    queryKey: ["nav-items-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nav_items_public" as any)
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return (data as unknown as NavItem[]) ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const settingsQuery = useQuery({
    queryKey: ["nav-settings-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nav_settings_public" as any)
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as NavSettings) ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const items = itemsQuery.data && itemsQuery.data.length > 0
    ? itemsQuery.data.filter((i) => i.is_active)
    : FALLBACK_ITEMS;

  const settings = settingsQuery.data ?? FALLBACK_SETTINGS;

  // Resolve logos: if DB has URLs use them, otherwise use local assets
  const resolvedLogoLight = settings.logo_light_url || logoLight;
  const resolvedLogoDark = settings.logo_dark_url || logoDark;

  return {
    items,
    logos: { light: resolvedLogoLight, dark: resolvedLogoDark },
    loading: itemsQuery.isLoading || settingsQuery.isLoading,
    error: itemsQuery.error || settingsQuery.error,
  };
}
