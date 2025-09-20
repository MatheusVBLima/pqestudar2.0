import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'admin' | 'moderator' | 'user';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export const useUserRoles = () => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserRoles = async () => {
    if (!user) {
      setUserRoles([]);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setUserRoles(data || []);
      setIsAdmin(data?.some(role => role.role === 'admin') || false);
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
      setUserRoles([]);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: AppRole): boolean => {
    return userRoles.some(userRole => userRole.role === role);
  };

  const assignRole = async (userId: string, role: AppRole) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role: role
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Atualizar estado local se for o usuário atual
      if (userId === user?.id) {
        setUserRoles(prev => [...prev, data]);
        if (role === 'admin') {
          setIsAdmin(true);
        }
      }
      
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
      
      // Atualizar estado local se for o usuário atual
      if (userId === user?.id) {
        setUserRoles(prev => prev.filter(r => r.role !== role));
        if (role === 'admin') {
          setIsAdmin(false);
        }
      }
      
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, [user]);

  return {
    userRoles,
    isAdmin,
    loading,
    hasRole,
    assignRole,
    removeRole,
    refetch: fetchUserRoles
  };
};