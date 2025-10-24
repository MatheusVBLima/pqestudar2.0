import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

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

export const usePartners = (includeInactive = false) => {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('partners')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPartners(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar parceiros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os parceiros.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addPartner = async (partner: Omit<Partner, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .insert([{
          ...partner,
          created_by: user?.id,
          updated_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setPartners(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order));
      toast({
        title: "Sucesso",
        description: "Parceiro adicionado com sucesso!"
      });
      
      return { data, error: null };
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Não foi possível adicionar o parceiro.",
        variant: "destructive"
      });
      return { data: null, error: err.message };
    }
  };

  const updatePartner = async (id: string, updates: Partial<Partner>) => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .update({
          ...updates,
          updated_by: user?.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPartners(prev => 
        prev.map(p => p.id === id ? data : p)
          .sort((a, b) => a.sort_order - b.sort_order)
      );
      
      toast({
        title: "Sucesso",
        description: "Parceiro atualizado com sucesso!"
      });
      
      return { data, error: null };
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Não foi possível atualizar o parceiro.",
        variant: "destructive"
      });
      return { data: null, error: err.message };
    }
  };

  const deletePartner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPartners(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Parceiro removido com sucesso!"
      });
      
      return { error: null };
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Não foi possível remover o parceiro.",
        variant: "destructive"
      });
      return { error: err.message };
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    return updatePartner(id, { is_active: !currentState });
  };

  useEffect(() => {
    fetchPartners();
  }, [includeInactive]);

  return {
    partners,
    loading,
    addPartner,
    updatePartner,
    deletePartner,
    toggleActive,
    refetch: fetchPartners
  };
};
