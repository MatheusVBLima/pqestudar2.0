-- =============================================
-- FASE 1: ÁREA PREMIUM - ESTRUTURA BASE
-- =============================================

-- 1) CRIAR ENUMS PARA PREMIUM
-- =============================================

-- Tipo de plano de assinatura
CREATE TYPE public.subscription_plan_type AS ENUM ('monthly', 'annual', 'trial_30d');

-- Status da assinatura
CREATE TYPE public.subscription_status AS ENUM ('active', 'inactive', 'expired', 'canceled');

-- Status do token de resgate
CREATE TYPE public.redeem_token_status AS ENUM ('new', 'used', 'expired', 'revoked');

-- Tipo de item premium (curso ou vaga)
CREATE TYPE public.premium_item_type AS ENUM ('course', 'job');

-- Status de conteúdo (rascunho ou publicado)
CREATE TYPE public.content_status AS ENUM ('draft', 'published');


-- 2) CRIAR TABELAS PREMIUM
-- =============================================

-- Tabela de assinaturas
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.subscription_status NOT NULL DEFAULT 'inactive',
  plan_type public.subscription_plan_type NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_user_unique UNIQUE (user_id)
);

-- Índices para subscriptions
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status_ends_at ON public.subscriptions(status, ends_at);


-- Tabela de tokens de resgate (pós-compra externa)
CREATE TABLE public.redeem_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  plan_type public.subscription_plan_type NOT NULL,
  status public.redeem_token_status NOT NULL DEFAULT 'new',
  buyer_email TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para redeem_tokens
CREATE INDEX idx_redeem_tokens_token ON public.redeem_tokens(token);
CREATE INDEX idx_redeem_tokens_status ON public.redeem_tokens(status);


-- Tabela unificada de itens premium (cursos + vagas)
CREATE TABLE public.premium_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type public.premium_item_type NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description_short TEXT,
  description_full TEXT,
  logo_url TEXT,
  external_url TEXT,
  tags TEXT[] DEFAULT '{}',
  status public.content_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para premium_items
CREATE INDEX idx_premium_items_item_type ON public.premium_items(item_type);
CREATE INDEX idx_premium_items_status ON public.premium_items(status);
CREATE INDEX idx_premium_items_slug ON public.premium_items(slug);


-- Tabela de atualizações semanais
CREATE TABLE public.weekly_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  intro TEXT,
  highlight TEXT,
  status public.content_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para weekly_updates
CREATE INDEX idx_weekly_updates_status ON public.weekly_updates(status);
CREATE INDEX idx_weekly_updates_slug ON public.weekly_updates(slug);


-- Tabela de itens das atualizações semanais
CREATE TABLE public.weekly_update_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  update_id UUID NOT NULL REFERENCES public.weekly_updates(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.premium_items(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('courses', 'jobs')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT weekly_update_items_unique UNIQUE (update_id, item_id, section)
);

-- Índices para weekly_update_items
CREATE INDEX idx_weekly_update_items_update_id ON public.weekly_update_items(update_id);


-- Tabela de páginas de curadoria premium
CREATE TABLE public.premium_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  status public.content_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para premium_pages
CREATE INDEX idx_premium_pages_status ON public.premium_pages(status);
CREATE INDEX idx_premium_pages_slug ON public.premium_pages(slug);


-- Tabela de itens das páginas de curadoria
CREATE TABLE public.premium_page_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.premium_pages(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.premium_items(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT premium_page_items_unique UNIQUE (page_id, item_id)
);

-- Índices para premium_page_items
CREATE INDEX idx_premium_page_items_page_id ON public.premium_page_items(page_id);


-- 3) FUNÇÃO has_active_subscription()
-- =============================================

CREATE OR REPLACE FUNCTION public.has_active_subscription()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND ends_at > now()
  )
$$;


-- 4) TRIGGERS PARA updated_at
-- =============================================

-- Trigger para subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para premium_items
CREATE TRIGGER update_premium_items_updated_at
  BEFORE UPDATE ON public.premium_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para weekly_updates
CREATE TRIGGER update_weekly_updates_updated_at
  BEFORE UPDATE ON public.weekly_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para premium_pages
CREATE TRIGGER update_premium_pages_updated_at
  BEFORE UPDATE ON public.premium_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- 5) HABILITAR RLS EM TODAS AS TABELAS PREMIUM
-- =============================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redeem_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_update_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_page_items ENABLE ROW LEVEL SECURITY;


-- 6) POLICIES RLS - SUBSCRIPTIONS
-- =============================================

-- Admin pode tudo em subscriptions
CREATE POLICY "Admins can manage subscriptions"
ON public.subscriptions FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Usuário pode ver apenas sua própria assinatura
CREATE POLICY "Users can view own subscription"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);


-- 7) POLICIES RLS - REDEEM_TOKENS
-- =============================================

-- Admin pode tudo em redeem_tokens
CREATE POLICY "Admins can manage redeem_tokens"
ON public.redeem_tokens FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- 8) POLICIES RLS - PREMIUM_ITEMS
-- =============================================

-- Admin pode tudo em premium_items
CREATE POLICY "Admins can manage premium_items"
ON public.premium_items FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Assinante ativo pode ver itens publicados
CREATE POLICY "Active subscribers can view published premium_items"
ON public.premium_items FOR SELECT
USING (
  status = 'published' 
  AND public.has_active_subscription()
);


-- 9) POLICIES RLS - WEEKLY_UPDATES
-- =============================================

-- Admin pode tudo em weekly_updates
CREATE POLICY "Admins can manage weekly_updates"
ON public.weekly_updates FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Assinante ativo pode ver atualizações publicadas
CREATE POLICY "Active subscribers can view published weekly_updates"
ON public.weekly_updates FOR SELECT
USING (
  status = 'published' 
  AND public.has_active_subscription()
);


-- 10) POLICIES RLS - WEEKLY_UPDATE_ITEMS
-- =============================================

-- Admin pode tudo em weekly_update_items
CREATE POLICY "Admins can manage weekly_update_items"
ON public.weekly_update_items FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Assinante ativo pode ver itens de atualizações publicadas
CREATE POLICY "Active subscribers can view weekly_update_items"
ON public.weekly_update_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.weekly_updates wu
    WHERE wu.id = weekly_update_items.update_id
      AND wu.status = 'published'
  )
  AND public.has_active_subscription()
);


-- 11) POLICIES RLS - PREMIUM_PAGES
-- =============================================

-- Admin pode tudo em premium_pages
CREATE POLICY "Admins can manage premium_pages"
ON public.premium_pages FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Assinante ativo pode ver páginas publicadas
CREATE POLICY "Active subscribers can view published premium_pages"
ON public.premium_pages FOR SELECT
USING (
  status = 'published' 
  AND public.has_active_subscription()
);


-- 12) POLICIES RLS - PREMIUM_PAGE_ITEMS
-- =============================================

-- Admin pode tudo em premium_page_items
CREATE POLICY "Admins can manage premium_page_items"
ON public.premium_page_items FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Assinante ativo pode ver itens de páginas publicadas
CREATE POLICY "Active subscribers can view premium_page_items"
ON public.premium_page_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.premium_pages pp
    WHERE pp.id = premium_page_items.page_id
      AND pp.status = 'published'
  )
  AND public.has_active_subscription()
);