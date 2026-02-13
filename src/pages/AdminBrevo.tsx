import { useState, useEffect } from "react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, BarChart3, Settings } from "lucide-react";

interface BrevoConfig {
  id: string;
  default_list_id: string;
  default_tags: string[];
  opt_in_mode: 'single_opt_in' | 'double_opt_in';
  webhook_url: string | null;
  allow_resend_welcome: boolean;
  success_message_doi: string;
  success_message_single: string;
  error_message_already_subscribed: string;
  error_message_generic: string;
}

interface NewsletterStats {
  todayCount: number;
  weekCount: number;
  errorRate: number;
  topUtms: Array<{ source: string; count: number }>;
  doiConfirmationRate: number;
}

const AdminBrevo = () => {
  const { isAdmin, loading: roleLoading } = useUserRoles();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<BrevoConfig | null>(null);
  const [stats, setStats] = useState<NewsletterStats | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadConfig();
      loadStats();
    }
  }, [isAdmin]);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('brevo_config')
        .select('*')
        .single();

      if (error) throw error;
      setConfig(data as BrevoConfig);
    } catch (error) {
      console.error('Error loading config:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações da Brevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Get today's count
      const { count: todayCount } = await supabase
        .from('newsletter_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'newsletter_listed')
        .gte('created_at', today.toISOString());

      // Get week's count
      const { count: weekCount } = await supabase
        .from('newsletter_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'newsletter_listed')
        .gte('created_at', weekAgo.toISOString());

      // Get error count
      const { count: errorCount } = await supabase
        .from('newsletter_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'newsletter_error')
        .gte('created_at', weekAgo.toISOString());

      const totalWeek = (weekCount || 0) + (errorCount || 0);
      const errorRate = totalWeek > 0 ? ((errorCount || 0) / totalWeek) * 100 : 0;

      // Get top UTMs
      const { data: utmData } = await supabase
        .from('newsletter_events')
        .select('utm_source')
        .eq('event_type', 'newsletter_listed')
        .gte('created_at', weekAgo.toISOString())
        .not('utm_source', 'is', null);

      const utmCounts: Record<string, number> = {};
      utmData?.forEach(row => {
        if (row.utm_source) {
          utmCounts[row.utm_source] = (utmCounts[row.utm_source] || 0) + 1;
        }
      });

      const topUtms = Object.entries(utmCounts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get DOI confirmation rate
      const { count: confirmedCount } = await supabase
        .from('newsletter_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'newsletter_confirmed')
        .gte('created_at', weekAgo.toISOString());

      const doiConfirmationRate = weekCount && weekCount > 0 
        ? ((confirmedCount || 0) / weekCount) * 100 
        : 0;

      setStats({
        todayCount: todayCount || 0,
        weekCount: weekCount || 0,
        errorRate,
        topUtms,
        doiConfirmationRate,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveConfig = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('brevo_config')
        .update({
          default_list_id: config.default_list_id,
          default_tags: config.default_tags,
          opt_in_mode: config.opt_in_mode,
          webhook_url: config.webhook_url,
          allow_resend_welcome: config.allow_resend_welcome,
          success_message_doi: config.success_message_doi,
          success_message_single: config.success_message_single,
          error_message_already_subscribed: config.error_message_already_subscribed,
          error_message_generic: config.error_message_generic,
        })
        .eq('id', config.id);

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Configuração não encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Configuração Brevo</h1>
          <p className="text-muted-foreground mb-8">
            Gerencie a integração com Brevo e visualize métricas de inscrições.
          </p>

          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="config">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart3 className="w-4 h-4 mr-2" />
                Métricas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Config Brevo</CardTitle>
                  <CardDescription>
                    Configure a API key no painel de secrets. ID da lista e tags padrão podem ser editados aqui.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="list-id">ID da Lista Padrão</Label>
                    <Input
                      id="list-id"
                      value={config.default_list_id}
                      onChange={(e) => setConfig({ ...config, default_list_id: e.target.value })}
                      placeholder="2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags Padrão (separadas por vírgula)</Label>
                    <Input
                      id="tags"
                      value={config.default_tags.join(', ')}
                      onChange={(e) => setConfig({ ...config, default_tags: e.target.value.split(',').map(t => t.trim()) })}
                      placeholder="curadoria_ferramenta, site-form"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Modo de Inscrição</Label>
                      <p className="text-sm text-muted-foreground">
                        {config.opt_in_mode === 'double_opt_in' ? 'Double Opt-in (requer confirmação)' : 'Single Opt-in (inscrição imediata)'}
                      </p>
                    </div>
                    <Switch
                      checked={config.opt_in_mode === 'double_opt_in'}
                      onCheckedChange={(checked) => setConfig({ ...config, opt_in_mode: checked ? 'double_opt_in' : 'single_opt_in' })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook">URL de Webhook (opcional)</Label>
                    <Input
                      id="webhook"
                      value={config.webhook_url || ''}
                      onChange={(e) => setConfig({ ...config, webhook_url: e.target.value || null })}
                      placeholder="https://seu-site.com/api/brevo-webhook"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Permitir Reenvio de Boas-vindas</Label>
                      <p className="text-sm text-muted-foreground">
                        Usuários já inscritos podem solicitar novo envio do email (00)
                      </p>
                    </div>
                    <Switch
                      checked={config.allow_resend_welcome}
                      onCheckedChange={(checked) => setConfig({ ...config, allow_resend_welcome: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mensagens & UX</CardTitle>
                  <CardDescription>
                    Personalize as mensagens exibidas aos usuários.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="msg-doi">Mensagem de Sucesso (Double Opt-in)</Label>
                    <Textarea
                      id="msg-doi"
                      value={config.success_message_doi}
                      onChange={(e) => setConfig({ ...config, success_message_doi: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="msg-single">Mensagem de Sucesso (Single Opt-in)</Label>
                    <Textarea
                      id="msg-single"
                      value={config.success_message_single}
                      onChange={(e) => setConfig({ ...config, success_message_single: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="msg-already">Mensagem Email Já Inscrito</Label>
                    <Textarea
                      id="msg-already"
                      value={config.error_message_already_subscribed}
                      onChange={(e) => setConfig({ ...config, error_message_already_subscribed: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="msg-error">Mensagem de Erro Genérico</Label>
                    <Textarea
                      id="msg-error"
                      value={config.error_message_generic}
                      onChange={(e) => setConfig({ ...config, error_message_generic: e.target.value })}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={saveConfig} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6 mt-6">
              {stats && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Inscritos Hoje</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{stats.todayCount}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Inscritos (7 dias)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{stats.weekCount}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Taxa de Erro</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{stats.errorRate.toFixed(1)}%</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Confirmação DOI</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{stats.doiConfirmationRate.toFixed(1)}%</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top UTM Sources (7 dias)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats.topUtms.length > 0 ? (
                        <div className="space-y-2">
                          {stats.topUtms.map((utm, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                              <span className="font-medium">{utm.source}</span>
                              <span className="text-muted-foreground">{utm.count} inscrições</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Nenhum dado de UTM disponível</p>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
    </div>
  );
};

export default AdminBrevo;
