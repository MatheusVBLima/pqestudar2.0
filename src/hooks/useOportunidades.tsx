import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FonteOportunidade {
  id?: string;
  oportunidade_id?: string;
  source_url: string;
  source_title?: string;
  source_tipo: "oficial" | "diario" | "banca" | "outro-oficial";
  source_date?: string;
}

export interface Oportunidade {
  id: string;
  categoria: "Concurso" | "Políticas Públicas" | "Educação";
  titulo: string;
  abrangencia: "Nacional" | "Estadual" | "Municipal";
  situacao: "Previsto" | "Edital publicado" | "Aberto" | "Encerrado";
  data_publicacao: string;
  visualizacoes: number;
  tipo: "Concurso" | "Programa educacional" | "Processo seletivo";
  escolaridade: "Fundamental" | "Médio" | "Superior";
  link_edital?: string;
  orgao?: string;
  banca?: string;
  resumo_editorial?: string;
  slug: string;
  publicado: boolean;
  created_at: string;
  updated_at: string;
  fontes_oportunidade?: FonteOportunidade[];
}

export interface OportunidadeFilters {
  situacao?: string[];
  tipo?: string[];
  escolaridade?: string[];
  abrangencia?: string[];
  source_tipo?: string[];
}

export type OportunidadeInput = Omit<Oportunidade, "id" | "visualizacoes" | "created_at" | "updated_at" | "fontes_oportunidade"> & {
  id?: string;
  fontes?: FonteOportunidade[];
};

export function useOportunidades(filters?: OportunidadeFilters) {
  const queryClient = useQueryClient();

  // Fetch public oportunidades (published only)
  const {
    data: oportunidades = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["oportunidades-public", filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oportunidades")
        .select("*")
        .eq("publicado", true)
        .order("data_publicacao", { ascending: false });

      if (error) throw error;

      let result = (data || []) as unknown as Oportunidade[];

      // Apply filters client-side for views
      if (filters?.situacao?.length) {
        result = result.filter(o => filters.situacao!.includes(o.situacao));
      }
      if (filters?.tipo?.length) {
        result = result.filter(o => filters.tipo!.includes(o.tipo));
      }
      if (filters?.escolaridade?.length) {
        result = result.filter(o => filters.escolaridade!.includes(o.escolaridade));
      }
      if (filters?.abrangencia?.length) {
        result = result.filter(o => filters.abrangencia!.includes(o.abrangencia));
      }

      return result;
    },
  });

  // Fetch single oportunidade by slug with fontes
  const fetchBySlug = useCallback(async (slug: string): Promise<Oportunidade | null> => {
    const { data: oportunidade, error } = await supabase
      .from("oportunidades")
      .select("*")
      .eq("slug", slug)
      .eq("publicado", true)
      .single();

    if (error || !oportunidade) return null;

    // Fetch fontes
    const { data: fontes } = await supabase
      .from("fontes_oportunidade")
      .select("*")
      .eq("oportunidade_id", (oportunidade as any).id);

    return {
      ...(oportunidade as any),
      fontes_oportunidade: (fontes || []) as unknown as FonteOportunidade[],
    } as Oportunidade;
  }, []);

  // Increment views (silent, no auth required)
  const incrementViews = useCallback(async (_id: string) => {
    // Silent - view tracking would need a dedicated endpoint
  }, []);

  return {
    oportunidades,
    isLoading,
    error,
    refetch,
    fetchBySlug,
    incrementViews,
  };
}

export function useOportunidadesAdmin() {
  const queryClient = useQueryClient();

  // Fetch all oportunidades (including unpublished) for admin
  const {
    data: oportunidades = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["oportunidades-admin"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("admin-oportunidades", {
        method: "GET",
      });

      if (error) throw error;
      return data as Oportunidade[];
    },
  });

  // Create oportunidade
  const createMutation = useMutation({
    mutationFn: async (input: OportunidadeInput) => {
      const { data, error } = await supabase.functions.invoke("admin-oportunidades", {
        method: "POST",
        body: input,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as Oportunidade;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oportunidades-admin"] });
      queryClient.invalidateQueries({ queryKey: ["oportunidades-public"] });
      toast.success("Oportunidade criada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar oportunidade");
    },
  });

  // Update oportunidade
  const updateMutation = useMutation({
    mutationFn: async (input: OportunidadeInput) => {
      const { data, error } = await supabase.functions.invoke("admin-oportunidades", {
        method: "PUT",
        body: input,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as Oportunidade;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oportunidades-admin"] });
      queryClient.invalidateQueries({ queryKey: ["oportunidades-public"] });
      toast.success("Oportunidade atualizada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar oportunidade");
    },
  });

  // Delete oportunidade
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke("admin-oportunidades", {
        method: "DELETE",
        body: {},
        headers: {},
      });

      // Use query param for delete
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://omkxiomwzbykmqttfozi.supabase.co"}/functions/v1/admin-oportunidades?id=${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erro ao excluir");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oportunidades-admin"] });
      queryClient.invalidateQueries({ queryKey: ["oportunidades-public"] });
      toast.success("Oportunidade excluída com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao excluir oportunidade");
    },
  });

  // Toggle publicado
  const togglePublicadoMutation = useMutation({
    mutationFn: async ({ id, publicado }: { id: string; publicado: boolean }) => {
      const response = await fetch(
        `https://omkxiomwzbykmqttfozi.supabase.co/functions/v1/admin-oportunidades?action=toggle`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, publicado }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erro ao alterar visibilidade");
      return result;
    },
    onSuccess: (_, { publicado }) => {
      queryClient.invalidateQueries({ queryKey: ["oportunidades-admin"] });
      queryClient.invalidateQueries({ queryKey: ["oportunidades-public"] });
      toast.success(publicado ? "Oportunidade publicada!" : "Oportunidade despublicada");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao alterar visibilidade");
    },
  });

  return {
    oportunidades,
    isLoading,
    error,
    refetch,
    createOportunidade: createMutation.mutateAsync,
    updateOportunidade: updateMutation.mutateAsync,
    deleteOportunidade: deleteMutation.mutateAsync,
    togglePublicado: togglePublicadoMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}