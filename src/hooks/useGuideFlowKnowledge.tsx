import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useGuideFlowKnowledge() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guide-flow-knowledge`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: 'list' }),
        }
      );
      if (!resp.ok) throw new Error('Erro ao carregar biblioteca');
      const data = await resp.json();
      setEntries(data);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const createEntry = async (entry: Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const resp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guide-flow-knowledge`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'create', ...entry }),
      }
    );
    if (!resp.ok) { const e = await resp.json(); throw new Error(e.error); }
    await fetchEntries();
  };

  const updateEntry = async (id: string, updates: Partial<KnowledgeEntry>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const resp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guide-flow-knowledge`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'update', id, ...updates }),
      }
    );
    if (!resp.ok) { const e = await resp.json(); throw new Error(e.error); }
    await fetchEntries();
  };

  const deleteEntry = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const resp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guide-flow-knowledge`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ action: 'delete', id }),
      }
    );
    if (!resp.ok) { const e = await resp.json(); throw new Error(e.error); }
    await fetchEntries();
  };

  return { entries, isLoading, fetchEntries, createEntry, updateEntry, deleteEntry };
}
