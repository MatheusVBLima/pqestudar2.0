import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'expired' | 'canceled';
  plan_type: 'monthly' | 'annual' | 'trial_30d';
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // PGRST116 = no rows found, which is expected for users without subscription
        if (fetchError.code === 'PGRST116') {
          setSubscription(null);
        } else {
          console.error('Error fetching subscription:', fetchError);
          setError('Erro ao verificar assinatura');
        }
      } else {
        setSubscription(data as Subscription);
      }
    } catch (err) {
      console.error('Unexpected error fetching subscription:', err);
      setError('Erro inesperado ao verificar assinatura');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check if subscription is currently active
  const isActive = useCallback(() => {
    if (!subscription) return false;
    if (subscription.status !== 'active') return false;
    
    const endsAt = new Date(subscription.ends_at);
    const now = new Date();
    return endsAt > now;
  }, [subscription]);

  // Get remaining days
  const getRemainingDays = useCallback(() => {
    if (!subscription || !isActive()) return 0;
    
    const endsAt = new Date(subscription.ends_at);
    const now = new Date();
    const diffTime = endsAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [subscription, isActive]);

  // Get plan display name
  const getPlanName = useCallback(() => {
    if (!subscription) return null;
    
    switch (subscription.plan_type) {
      case 'monthly':
        return 'Mensal';
      case 'annual':
        return 'Anual';
      case 'trial_30d':
        return 'Trial 30 dias';
      default:
        return subscription.plan_type;
    }
  }, [subscription]);

  // Redeem a token
  const redeemToken = useCallback(async (token: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Você precisa estar logado para resgatar um token.' };
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return { success: false, message: 'Sessão expirada. Faça login novamente.' };
      }

      const response = await supabase.functions.invoke('redeem-token', {
        body: { token },
      });

      if (response.error) {
        console.error('Error redeeming token:', response.error);
        return { 
          success: false, 
          message: response.error.message || 'Erro ao resgatar token. Tente novamente.' 
        };
      }

      if (response.data?.success) {
        // Refresh subscription data
        await fetchSubscription();
        return { success: true, message: response.data.message || 'Assinatura ativada com sucesso!' };
      }

      return { 
        success: false, 
        message: response.data?.error || 'Erro desconhecido ao resgatar token.' 
      };
    } catch (err: any) {
      console.error('Unexpected error redeeming token:', err);
      return { success: false, message: 'Erro inesperado. Tente novamente.' };
    }
  }, [user, fetchSubscription]);

  // Initial fetch
  useEffect(() => {
    if (!authLoading) {
      fetchSubscription();
    }
  }, [authLoading, fetchSubscription]);

  return {
    subscription,
    loading: authLoading || loading,
    error,
    isActive,
    getRemainingDays,
    getPlanName,
    redeemToken,
    refetch: fetchSubscription,
  };
};
