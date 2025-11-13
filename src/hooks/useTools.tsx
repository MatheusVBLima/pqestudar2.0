import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Tool {
  id: string;
  name: string;
  description: string;
  url?: string;
  icon_url?: string;
  tags: string[];
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export const useTools = (includeInvisible = false) => {
  const { user } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTools = async () => {
    try {
      setLoading(true);
      
      if (includeInvisible) {
        // Admin mode: busca via edge function com service role
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Admin access requires authentication');
        
        const { data, error } = await supabase.functions.invoke('admin-tools', {
          body: { action: 'list' }
        });
        
        if (error) throw error;
        
        setTools(data || []);
      } else {
        // Public mode: usa VIEW 'tools_public'
        const { data, error } = await supabase
          .from('tools_public')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) throw error;
        
        setTools(data || []);
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao buscar ferramentas:', error);
      }
      
      if (includeInvisible) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as ferramentas.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const addTool = async (tool: Omit<Tool, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by' | 'sort_order'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.functions.invoke('admin-tools', {
        body: {
          action: 'create',
          data: tool
        }
      });

      if (error) {
        // Log detalhado em dev
        if (process.env.NODE_ENV === 'development') {
          console.error('[useTools] Edge function error:', {
            url: 'admin-tools',
            method: 'POST',
            status: error.status,
            body: error
          });
        }
        throw error;
      }

      await fetchTools();
      toast({
        title: "Sucesso",
        description: "Ferramenta adicionada com sucesso!"
      });
      
      return { data, error: null };
    } catch (err: any) {
      // Extrair mensagem do JSON se disponível
      const message = err?.context?.message || err?.message || "Não foi possível adicionar a ferramenta.";
      
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
      return { data: null, error: err.message };
    }
  };

  const updateTool = async (id: string, updates: Partial<Tool>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.functions.invoke('admin-tools', {
        body: {
          action: 'update',
          data: { id, ...updates }
        }
      });

      if (error) {
        // Log detalhado em dev
        if (process.env.NODE_ENV === 'development') {
          console.error('[useTools] Edge function error:', {
            url: 'admin-tools',
            method: 'PATCH',
            status: error.status,
            body: error
          });
        }
        throw error;
      }

      await fetchTools();
      toast({
        title: "Sucesso",
        description: "Ferramenta atualizada com sucesso!"
      });
      
      return { data, error: null };
    } catch (err: any) {
      // Extrair mensagem do JSON se disponível
      const message = err?.context?.message || err?.message || "Não foi possível atualizar a ferramenta.";
      
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
      return { data: null, error: err.message };
    }
  };

  const deleteTool = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { error } = await supabase.functions.invoke('admin-tools', {
        body: {
          action: 'delete',
          data: { id }
        }
      });

      if (error) {
        // Log detalhado em dev
        if (process.env.NODE_ENV === 'development') {
          console.error('[useTools] Edge function error:', {
            url: 'admin-tools',
            method: 'DELETE',
            status: error.status,
            body: error
          });
        }
        throw error;
      }

      await fetchTools();
      toast({
        title: "Sucesso",
        description: "Ferramenta removida com sucesso!"
      });
      
      return { error: null };
    } catch (err: any) {
      // Extrair mensagem do JSON se disponível
      const message = err?.context?.message || err?.message || "Não foi possível remover a ferramenta.";
      
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
      return { error: err.message };
    }
  };

  const toggleVisible = async (id: string, currentState: boolean) => {
    return updateTool(id, { is_visible: !currentState });
  };

  const reorderTools = async (reorderedTools: Tool[]) => {
    const startTime = Date.now();
    console.log('[Tools Reorder] Starting reorder operation', {
      count: reorderedTools.length,
      items: reorderedTools.map((t, idx) => ({ id: t.id, name: t.name, newOrder: idx }))
    });

    // Atualizar UI otimisticamente
    const previousTools = [...tools];
    setTools(reorderedTools);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const { error } = await supabase.functions.invoke('admin-tools', {
        body: {
          action: 'reorder',
          data: { 
            tools: reorderedTools.map((t, index) => ({ id: t.id, sort_order: index }))
          }
        }
      });

      if (error) {
        // Log detalhado em dev
        if (process.env.NODE_ENV === 'development') {
          console.error('[useTools] Edge function error:', {
            url: 'admin-tools',
            method: 'PATCH',
            status: error.status,
            body: error
          });
        }
        throw error;
      }

      const duration = Date.now() - startTime;
      console.log('[Tools Reorder] Success', { duration: `${duration}ms` });

      await fetchTools();
      toast({
        title: "Ordem atualizada",
        description: "A ordem das ferramentas foi salva com sucesso."
      });

      return { error: null };
    } catch (err: any) {
      console.error('[Tools Reorder] Error', { 
        error: err.message, 
        duration: `${Date.now() - startTime}ms` 
      });

      // Reverter para ordem anterior
      setTools(previousTools);

      // Extrair mensagem do JSON se disponível
      const message = err?.context?.message || err?.message || "Não foi possível salvar a nova ordem. Tente novamente.";

      toast({
        title: "Erro ao salvar ordem",
        description: message,
        variant: "destructive"
      });

      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchTools();
  }, [includeInvisible]);

  return {
    tools,
    loading,
    addTool,
    updateTool,
    deleteTool,
    toggleVisible,
    reorderTools,
    refetch: fetchTools
  };
};
