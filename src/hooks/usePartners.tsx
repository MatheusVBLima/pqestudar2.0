import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/error-message';

export interface Partner {
  id: string;
  title: string;
  logo_url: string;
  url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

interface AdminPartnerRow extends Partner {
  display_order?: number;
}

export const usePartners = (includeInactive = false) => {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      
      // Modo admin: busca via edge function com service role
      // Modo público: busca da VIEW segura sem campos sensíveis (created_by, updated_by)
      if (includeInactive) {
        // Admin mode: requer auth e busca todos os parceiros (incluindo inativos)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Admin access requires authentication');
        
        const { data, error } = await supabase.functions.invoke('admin-partners', {
          body: { action: 'list' }
        });
        
        if (error) throw error;
        
        // Mapear campos da resposta para o formato esperado
        const mappedData = ((data ?? []) as AdminPartnerRow[]).map((p) => ({
          id: p.id,
          title: p.title,
          logo_url: p.logo_url,
          url: p.url,
          sort_order: p.sort_order,
          display_order: p.sort_order,
          is_active: p.is_active,
          created_by: p.created_by,
          updated_by: p.updated_by,
          created_at: p.created_at,
          updated_at: p.updated_at
        })) || [];
        
        setPartners(mappedData);
      } else {
        // Public mode: usa VIEW 'active_partners' (alias de partners_public)
        const { data, error } = await supabase
          .from('active_partners')
          .select('id, title, logo_url, partner_url, display_order, is_active, updated_at');

        if (error) throw error;
        
        // Mapear campos da VIEW para o tipo Partner
        setPartners((data || []).map(p => ({
          id: p.id,
          title: p.title,
          logo_url: p.logo_url,
          url: p.partner_url,
          sort_order: p.display_order,
          is_active: p.is_active,
          updated_at: p.updated_at,
          created_at: p.updated_at, // Usar updated_at como fallback
          created_by: undefined,
          updated_by: undefined
        })));
      }
    } catch (error: unknown) {
      // Log apenas em dev; evitar toast vermelho global na produção
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao buscar parceiros:', error);
      }
      
      // Não exibir toast de erro para modo público (evitar poluir UX)
      if (includeInactive) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os parceiros.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  const addPartner = async (partner: Omit<Partner, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.functions.invoke('admin-partners', {
        body: {
          action: 'create',
          data: partner
        }
      });

      if (error) throw error;

      await fetchPartners();
      toast({
        title: "Sucesso",
        description: "Parceiro adicionado com sucesso!"
      });
      
      return { data, error: null };
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Não foi possível adicionar o parceiro.");
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
      return { data: null, error: message };
    }
  };

  const updatePartner = async (id: string, updates: Partial<Partner>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.functions.invoke('admin-partners', {
        body: {
          action: 'update',
          data: { id, ...updates }
        }
      });

      if (error) throw error;

      await fetchPartners();
      toast({
        title: "Sucesso",
        description: "Parceiro atualizado com sucesso!"
      });
      
      return { data, error: null };
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Não foi possível atualizar o parceiro.");
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
      return { data: null, error: message };
    }
  };

  const deletePartner = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { error } = await supabase.functions.invoke('admin-partners', {
        body: {
          action: 'delete',
          data: { id }
        }
      });

      if (error) throw error;

      await fetchPartners();
      toast({
        title: "Sucesso",
        description: "Parceiro removido com sucesso!"
      });
      
      return { error: null };
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Não foi possível remover o parceiro.");
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
      return { error: message };
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    return updatePartner(id, { is_active: !currentState });
  };

  const reorderPartners = async (reorderedPartners: Partner[]) => {
    const startTime = Date.now();
    console.log('[Partners Reorder] Starting reorder operation', {
      count: reorderedPartners.length,
      items: reorderedPartners.map((p, idx) => ({ id: p.id, title: p.title, newOrder: idx }))
    });

    // Atualizar UI otimisticamente
    const previousPartners = [...partners];
    setPartners(reorderedPartners);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { error } = await supabase.functions.invoke('admin-partners', {
        body: {
          action: 'reorder',
          data: { 
            partners: reorderedPartners.map((p, index) => ({ id: p.id, sort_order: index }))
          }
        }
      });

      if (error) throw error;

      const duration = Date.now() - startTime;
      console.log('[Partners Reorder] Success', { duration: `${duration}ms` });

      await fetchPartners();
      toast({
        title: "Ordem atualizada",
        description: "A ordem dos parceiros foi salva com sucesso."
      });

      return { error: null };
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Não foi possível salvar a nova ordem.");
      console.error('[Partners Reorder] Error', { 
        error: message,
        duration: `${Date.now() - startTime}ms` 
      });

      // Reverter para ordem anterior
      setPartners(previousPartners);

      toast({
        title: "Erro ao salvar ordem",
        description: "Não foi possível salvar a nova ordem. Tente novamente.",
        variant: "destructive"
      });

      return { error: message };
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  return {
    partners,
    loading,
    addPartner,
    updatePartner,
    deletePartner,
    toggleActive,
    reorderPartners,
    refetch: fetchPartners
  };
};
