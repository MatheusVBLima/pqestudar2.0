import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { Tool } from './useTools';

export interface SavedTool {
  id: string;
  user_id: string;
  tool_id: string;
  created_at: string;
}

export const useSavedTools = () => {
  const { user } = useAuth();
  const [savedToolIds, setSavedToolIds] = useState<Set<string>>(new Set());
  const [savedTools, setSavedTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  // Fetch all saved tool IDs for the current user
  const fetchSavedToolIds = useCallback(async () => {
    if (!user) {
      setSavedToolIds(new Set());
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_tools')
        .select('tool_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedToolIds(new Set(data?.map(s => s.tool_id) || []));
    } catch (error) {
      console.error('Error fetching saved tool IDs:', error);
    }
  }, [user]);

  // Fetch saved tools with full tool data
  const fetchSavedTools = useCallback(async () => {
    if (!user) {
      setSavedTools([]);
      return;
    }

    setLoading(true);
    try {
      // First get saved tool IDs
      const { data: savedData, error: savedError } = await supabase
        .from('saved_tools')
        .select('tool_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (savedError) throw savedError;

      if (!savedData || savedData.length === 0) {
        setSavedTools([]);
        return;
      }

      const toolIds = savedData.map(s => s.tool_id);

      // Then get full tool data from public view
      const { data: toolsData, error: toolsError } = await supabase
        .from('tools_public')
        .select('*')
        .in('id', toolIds);

      if (toolsError) throw toolsError;

      // Sort by saved order (most recent first)
      const toolsMap = new Map(toolsData?.map(t => [t.id, t]) || []);
      const orderedTools = toolIds
        .map(id => toolsMap.get(id))
        .filter((t): t is NonNullable<typeof t> => t !== undefined) as Tool[];

      setSavedTools(orderedTools);
    } catch (error) {
      console.error('Error fetching saved tools:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas ferramentas salvas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check if a tool is saved
  const isSaved = useCallback((toolId: string) => {
    return savedToolIds.has(toolId);
  }, [savedToolIds]);

  // Toggle save/unsave a tool
  const toggleSave = useCallback(async (toolId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    const wasSaved = savedToolIds.has(toolId);
    
    // Optimistic update
    setLoadingIds(prev => new Set(prev).add(toolId));
    setSavedToolIds(prev => {
      const newSet = new Set(prev);
      if (wasSaved) {
        newSet.delete(toolId);
      } else {
        newSet.add(toolId);
      }
      return newSet;
    });

    try {
      if (wasSaved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_tools')
          .delete()
          .eq('user_id', user.id)
          .eq('tool_id', toolId);

        if (error) throw error;
      } else {
        // Add to saved
        const { error } = await supabase
          .from('saved_tools')
          .insert({ user_id: user.id, tool_id: toolId });

        if (error) throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error toggling save:', error);
      
      // Rollback optimistic update
      setSavedToolIds(prev => {
        const newSet = new Set(prev);
        if (wasSaved) {
          newSet.add(toolId);
        } else {
          newSet.delete(toolId);
        }
        return newSet;
      });

      toast({
        title: "Erro",
        description: wasSaved 
          ? "Não foi possível remover dos salvos." 
          : "Não foi possível salvar a ferramenta.",
        variant: "destructive"
      });

      return false;
    } finally {
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(toolId);
        return newSet;
      });
    }
  }, [user, savedToolIds]);

  // Check if a specific tool is being toggled
  const isToggling = useCallback((toolId: string) => {
    return loadingIds.has(toolId);
  }, [loadingIds]);

  // Initial fetch
  useEffect(() => {
    fetchSavedToolIds();
  }, [fetchSavedToolIds]);

  return {
    savedToolIds,
    savedTools,
    loading,
    isSaved,
    toggleSave,
    isToggling,
    fetchSavedTools,
    refetchIds: fetchSavedToolIds
  };
};
