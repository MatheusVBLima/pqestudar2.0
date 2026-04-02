import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Guide {
  id: string;
  title: string;
  slug: string;
  category: string;
  short_description: string;
  content_markdown: string;
  seo_title: string;
  seo_description: string;
  cta_top_label: string | null;
  cta_top_url: string | null;
  cta_middle_label: string | null;
  cta_middle_url: string | null;
  cta_final_label: string | null;
  cta_final_url: string | null;
  cta_top_text: string | null;
  cta_middle_text: string | null;
  cta_final_text: string | null;
  internal_links: Array<{ label: string; url: string }>;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  author_name: string;
  created_at: string;
  updated_at: string;
}

const GUIDES_KEY = ['guides'];

export function useGuides(includeUnpublished = false) {
  return useQuery({
    queryKey: [...GUIDES_KEY, includeUnpublished ? 'all' : 'published'],
    queryFn: async () => {
      let query = supabase
        .from('guides' as any)
        .select('*')
        .order('sort_order', { ascending: true });

      // When not including unpublished, RLS already filters — but explicit is safer
      if (!includeUnpublished) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Guide[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useGuideBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: [...GUIDES_KEY, 'slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('guides' as any)
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Guide | null;
    },
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  });
}

export function useGuideRelatedTools(guideId: string | undefined) {
  return useQuery({
    queryKey: ['guide_related_tools', guideId],
    queryFn: async () => {
      if (!guideId) return [];
      const { data, error } = await supabase
        .from('guide_related_tools' as any)
        .select('tool_id')
        .eq('guide_id', guideId);
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      const toolIds = (data as any[]).map((r: any) => r.tool_id);
      const { data: tools, error: toolsError } = await supabase
        .from('tools_public' as any)
        .select('id, name, description, url, icon_url')
        .in('id', toolIds);
      if (toolsError) throw toolsError;
      return (tools ?? []) as any[];
    },
    enabled: !!guideId,
  });
}

export function useGuideRelatedContests(guideId: string | undefined) {
  return useQuery({
    queryKey: ['guide_related_contests', guideId],
    queryFn: async () => {
      if (!guideId) return [];
      const { data, error } = await supabase
        .from('guide_related_contests' as any)
        .select('contest_id')
        .eq('guide_id', guideId);
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      const ids = (data as any[]).map((r: any) => r.contest_id);
      const { data: contests, error: cErr } = await supabase
        .from('oportunidades_public' as any)
        .select('id, titulo, slug, situacao, tipo')
        .in('id', ids);
      if (cErr) throw cErr;
      return (contests ?? []) as any[];
    },
    enabled: !!guideId,
  });
}

export function useGuideRelatedGuides(guideId: string | undefined) {
  return useQuery({
    queryKey: ['guide_related_guides', guideId],
    queryFn: async () => {
      if (!guideId) return [];
      const { data, error } = await supabase
        .from('guide_related_guides' as any)
        .select('related_guide_id')
        .eq('guide_id', guideId);
      if (error) throw error;
      if (!data || data.length === 0) return [];
      
      const ids = (data as any[]).map((r: any) => r.related_guide_id);
      const { data: guides, error: gErr } = await supabase
        .from('guides' as any)
        .select('id, title, slug, short_description, category')
        .in('id', ids)
        .eq('is_published', true);
      if (gErr) throw gErr;
      return (guides ?? []) as any[];
    },
    enabled: !!guideId,
  });
}

// Admin mutations
export function useGuidesMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: GUIDES_KEY });
  };

  const createGuide = useMutation({
    mutationFn: async (guide: Partial<Guide>) => {
      const { data, error } = await supabase
        .from('guides' as any)
        .insert(guide as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Guide;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: 'Guia criado com sucesso' });
    },
    onError: (err: any) => {
      toast({ title: 'Erro ao criar guia', description: err.message, variant: 'destructive' });
    },
  });

  const updateGuide = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Guide> & { id: string }) => {
      const { error } = await supabase
        .from('guides' as any)
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: 'Guia atualizado' });
    },
    onError: (err: any) => {
      toast({ title: 'Erro ao atualizar guia', description: err.message, variant: 'destructive' });
    },
  });

  const deleteGuide = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('guides' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: 'Guia excluído' });
    },
    onError: (err: any) => {
      toast({ title: 'Erro ao excluir guia', description: err.message, variant: 'destructive' });
    },
  });

  const togglePublished = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from('guides' as any)
        .update({ is_published } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      invalidate();
      toast({ title: vars.is_published ? 'Guia publicado' : 'Guia despublicado' });
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase
        .from('guides' as any)
        .update({ is_featured } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      invalidate();
      toast({ title: vars.is_featured ? 'Guia em destaque' : 'Destaque removido' });
    },
  });

  return {
    createGuide,
    updateGuide,
    deleteGuide,
    togglePublished,
    toggleFeatured,
  };
}
