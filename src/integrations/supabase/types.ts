export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      anonymous_course_suggestions_rate_limit: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address: unknown
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
        }
        Relationships: []
      }
      atualizacoes_oportunidade: {
        Row: {
          created_at: string
          created_by: string | null
          data_atualizacao: string
          id: string
          oportunidade_id: string
          texto: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_atualizacao?: string
          id?: string
          oportunidade_id: string
          texto: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_atualizacao?: string
          id?: string
          oportunidade_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "atualizacoes_oportunidade_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atualizacoes_oportunidade_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades_public"
            referencedColumns: ["id"]
          },
        ]
      }
      brevo_config: {
        Row: {
          allow_resend_welcome: boolean
          api_key_encrypted: string | null
          created_at: string
          default_list_id: string
          default_tags: string[]
          error_message_already_subscribed: string
          error_message_generic: string
          id: string
          opt_in_mode: string
          success_message_doi: string
          success_message_single: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          allow_resend_welcome?: boolean
          api_key_encrypted?: string | null
          created_at?: string
          default_list_id?: string
          default_tags?: string[]
          error_message_already_subscribed?: string
          error_message_generic?: string
          id?: string
          opt_in_mode?: string
          success_message_doi?: string
          success_message_single?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          allow_resend_welcome?: boolean
          api_key_encrypted?: string | null
          created_at?: string
          default_list_id?: string
          default_tags?: string[]
          error_message_already_subscribed?: string
          error_message_generic?: string
          id?: string
          opt_in_mode?: string
          success_message_doi?: string
          success_message_single?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      coleta_config: {
        Row: {
          ano_alvo: number
          caminhos_bloqueados: Json
          caminhos_permitidos: Json
          created_at: string
          escopo: string
          extensoes_bloqueadas: Json
          id: string
          limite_paginas: number
          limite_resultados: number
          profundidade: number
          tema_consulta: string | null
          updated_at: string
        }
        Insert: {
          ano_alvo?: number
          caminhos_bloqueados?: Json
          caminhos_permitidos?: Json
          created_at?: string
          escopo?: string
          extensoes_bloqueadas?: Json
          id?: string
          limite_paginas?: number
          limite_resultados?: number
          profundidade?: number
          tema_consulta?: string | null
          updated_at?: string
        }
        Update: {
          ano_alvo?: number
          caminhos_bloqueados?: Json
          caminhos_permitidos?: Json
          created_at?: string
          escopo?: string
          extensoes_bloqueadas?: Json
          id?: string
          limite_paginas?: number
          limite_resultados?: number
          profundidade?: number
          tema_consulta?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coleta_run_items: {
        Row: {
          ano_alvo: number
          created_at: string
          data_coleta: string
          dominio: string
          hash_conteudo: string | null
          id: string
          meta_obs: string | null
          metodo_coleta: string
          motivo_descartar: string | null
          run_id: string
          status: string
          texto_bruto: string | null
          tipo_pagina: string
          url: string
        }
        Insert: {
          ano_alvo: number
          created_at?: string
          data_coleta?: string
          dominio: string
          hash_conteudo?: string | null
          id?: string
          meta_obs?: string | null
          metodo_coleta: string
          motivo_descartar?: string | null
          run_id: string
          status?: string
          texto_bruto?: string | null
          tipo_pagina?: string
          url: string
        }
        Update: {
          ano_alvo?: number
          created_at?: string
          data_coleta?: string
          dominio?: string
          hash_conteudo?: string | null
          id?: string
          meta_obs?: string | null
          metodo_coleta?: string
          motivo_descartar?: string | null
          run_id?: string
          status?: string
          texto_bruto?: string | null
          tipo_pagina?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "coleta_run_items_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "coleta_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      coleta_runs: {
        Row: {
          ano_alvo: number
          created_at: string
          executed_at: string
          filtros_snapshot: Json
          id: string
          limite_paginas: number | null
          limite_resultados: number | null
          profundidade: number | null
          sites_env: Json
          status_execucao: string
          tema_consulta: string | null
          tipo_coleta: string
          total_erros: number
          total_ignoradas: number
          total_novas: number
          total_urls: number
        }
        Insert: {
          ano_alvo: number
          created_at?: string
          executed_at?: string
          filtros_snapshot?: Json
          id?: string
          limite_paginas?: number | null
          limite_resultados?: number | null
          profundidade?: number | null
          sites_env?: Json
          status_execucao?: string
          tema_consulta?: string | null
          tipo_coleta: string
          total_erros?: number
          total_ignoradas?: number
          total_novas?: number
          total_urls?: number
        }
        Update: {
          ano_alvo?: number
          created_at?: string
          executed_at?: string
          filtros_snapshot?: Json
          id?: string
          limite_paginas?: number | null
          limite_resultados?: number | null
          profundidade?: number | null
          sites_env?: Json
          status_execucao?: string
          tema_consulta?: string | null
          tipo_coleta?: string
          total_erros?: number
          total_ignoradas?: number
          total_novas?: number
          total_urls?: number
        }
        Relationships: []
      }
      concursos_analyzed_urls: {
        Row: {
          analyzed_at: string
          ano: number | null
          content_hash: string | null
          created_at: string
          id: string
          ignore_reason: string | null
          ignored: boolean
          orgao: string | null
          situacao: string | null
          tema: string | null
          tipo: string | null
          url: string
          url_hash: string
        }
        Insert: {
          analyzed_at?: string
          ano?: number | null
          content_hash?: string | null
          created_at?: string
          id?: string
          ignore_reason?: string | null
          ignored?: boolean
          orgao?: string | null
          situacao?: string | null
          tema?: string | null
          tipo?: string | null
          url: string
          url_hash: string
        }
        Update: {
          analyzed_at?: string
          ano?: number | null
          content_hash?: string | null
          created_at?: string
          id?: string
          ignore_reason?: string | null
          ignored?: boolean
          orgao?: string | null
          situacao?: string | null
          tema?: string | null
          tipo?: string | null
          url?: string
          url_hash?: string
        }
        Relationships: []
      }
      concursos_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value?: Json
          created_at?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      concursos_pending_items: {
        Row: {
          abrangencia_detectada: string | null
          ai_engine: string | null
          ai_executed_at: string | null
          ai_response: Json | null
          ano_detectado: number | null
          banca_detectada: string | null
          categoria_detectada: string | null
          collected_at: string
          confiabilidade: number | null
          created_at: string
          curated_at: string | null
          curated_by: string | null
          escolaridade_detectada: string | null
          id: string
          link_edital: string | null
          oportunidade_id: string | null
          orgao_detectado: string | null
          rejection_reason: string | null
          resumo_editorial: string | null
          situacao_detectada: string | null
          source_domain: string | null
          source_title: string | null
          source_url: string
          status: string
          tipo_detectado: string | null
          titulo_sugerido: string | null
          updated_at: string
        }
        Insert: {
          abrangencia_detectada?: string | null
          ai_engine?: string | null
          ai_executed_at?: string | null
          ai_response?: Json | null
          ano_detectado?: number | null
          banca_detectada?: string | null
          categoria_detectada?: string | null
          collected_at?: string
          confiabilidade?: number | null
          created_at?: string
          curated_at?: string | null
          curated_by?: string | null
          escolaridade_detectada?: string | null
          id?: string
          link_edital?: string | null
          oportunidade_id?: string | null
          orgao_detectado?: string | null
          rejection_reason?: string | null
          resumo_editorial?: string | null
          situacao_detectada?: string | null
          source_domain?: string | null
          source_title?: string | null
          source_url: string
          status?: string
          tipo_detectado?: string | null
          titulo_sugerido?: string | null
          updated_at?: string
        }
        Update: {
          abrangencia_detectada?: string | null
          ai_engine?: string | null
          ai_executed_at?: string | null
          ai_response?: Json | null
          ano_detectado?: number | null
          banca_detectada?: string | null
          categoria_detectada?: string | null
          collected_at?: string
          confiabilidade?: number | null
          created_at?: string
          curated_at?: string | null
          curated_by?: string | null
          escolaridade_detectada?: string | null
          id?: string
          link_edital?: string | null
          oportunidade_id?: string | null
          orgao_detectado?: string | null
          rejection_reason?: string | null
          resumo_editorial?: string | null
          situacao_detectada?: string | null
          source_domain?: string | null
          source_title?: string | null
          source_url?: string
          status?: string
          tipo_detectado?: string | null
          titulo_sugerido?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "concursos_pending_items_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concursos_pending_items_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades_public"
            referencedColumns: ["id"]
          },
        ]
      }
      course_suggestions: {
        Row: {
          created_at: string
          id: string
          is_anonymous: boolean | null
          status: string | null
          suggestion: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          status?: string | null
          suggestion: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          status?: string | null
          suggestion?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      course_votes: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          vote_type: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          vote_type: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_votes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "active_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_votes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_votes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses_public"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          affiliate_link: string | null
          badge: Database["public"]["Enums"]["course_badge"] | null
          category: string
          created_at: string
          created_by: string | null
          description: string
          downvotes: number | null
          duration: string
          id: string
          image_url: string | null
          institution: string
          is_active: boolean
          is_hidden: boolean
          level: string
          price: string
          rating: number
          students: number
          title: string
          updated_at: string
          updated_by: string | null
          upvotes: number | null
          views: number
          vote_score: number | null
        }
        Insert: {
          affiliate_link?: string | null
          badge?: Database["public"]["Enums"]["course_badge"] | null
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          downvotes?: number | null
          duration: string
          id?: string
          image_url?: string | null
          institution: string
          is_active?: boolean
          is_hidden?: boolean
          level: string
          price: string
          rating?: number
          students?: number
          title: string
          updated_at?: string
          updated_by?: string | null
          upvotes?: number | null
          views?: number
          vote_score?: number | null
        }
        Update: {
          affiliate_link?: string | null
          badge?: Database["public"]["Enums"]["course_badge"] | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          downvotes?: number | null
          duration?: string
          id?: string
          image_url?: string | null
          institution?: string
          is_active?: boolean
          is_hidden?: boolean
          level?: string
          price?: string
          rating?: number
          students?: number
          title?: string
          updated_at?: string
          updated_by?: string | null
          upvotes?: number | null
          views?: number
          vote_score?: number | null
        }
        Relationships: []
      }
      fontes_oportunidade: {
        Row: {
          created_at: string
          id: string
          oportunidade_id: string
          source_date: string | null
          source_tipo: string
          source_title: string | null
          source_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          oportunidade_id: string
          source_date?: string | null
          source_tipo: string
          source_title?: string | null
          source_url: string
        }
        Update: {
          created_at?: string
          id?: string
          oportunidade_id?: string
          source_date?: string | null
          source_tipo?: string
          source_title?: string | null
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fontes_oportunidade_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fontes_oportunidade_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades_public"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_brutos: {
        Row: {
          ano_alvo: number
          created_at: string
          data_coleta: string
          dominio: string
          hash_conteudo: string | null
          id: string
          meta_obs: string | null
          metodo_coleta: string
          motivo_status: string | null
          status: string
          texto_bruto: string | null
          updated_at: string
          url: string
        }
        Insert: {
          ano_alvo?: number
          created_at?: string
          data_coleta?: string
          dominio: string
          hash_conteudo?: string | null
          id?: string
          meta_obs?: string | null
          metodo_coleta: string
          motivo_status?: string | null
          status?: string
          texto_bruto?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          ano_alvo?: number
          created_at?: string
          data_coleta?: string
          dominio?: string
          hash_conteudo?: string | null
          id?: string
          meta_obs?: string | null
          metodo_coleta?: string
          motivo_status?: string | null
          status?: string
          texto_bruto?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          author: string | null
          category: string
          created_at: string
          created_by: string | null
          embedding: string | null
          id: string
          image_url: string | null
          lang: string | null
          published_at: string
          source: string
          source_url: string
          summary: string
          title: string
          title_hash: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          embedding?: string | null
          id?: string
          image_url?: string | null
          lang?: string | null
          published_at: string
          source: string
          source_url: string
          summary: string
          title: string
          title_hash: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          embedding?: string | null
          id?: string
          image_url?: string | null
          lang?: string | null
          published_at?: string
          source?: string
          source_url?: string
          summary?: string
          title?: string
          title_hash?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      news_generation_logs: {
        Row: {
          candidates_fetched: number | null
          created_at: string
          discarded_duplicate_hash: number | null
          discarded_duplicate_semantic: number | null
          discarded_duplicate_topic: number | null
          discarded_duplicate_url: number | null
          discarded_old: number | null
          executed_by: string | null
          execution_details: Json | null
          id: string
          published_count: number | null
        }
        Insert: {
          candidates_fetched?: number | null
          created_at?: string
          discarded_duplicate_hash?: number | null
          discarded_duplicate_semantic?: number | null
          discarded_duplicate_topic?: number | null
          discarded_duplicate_url?: number | null
          discarded_old?: number | null
          executed_by?: string | null
          execution_details?: Json | null
          id?: string
          published_count?: number | null
        }
        Update: {
          candidates_fetched?: number | null
          created_at?: string
          discarded_duplicate_hash?: number | null
          discarded_duplicate_semantic?: number | null
          discarded_duplicate_topic?: number | null
          discarded_duplicate_url?: number | null
          discarded_old?: number | null
          executed_by?: string | null
          execution_details?: Json | null
          id?: string
          published_count?: number | null
        }
        Relationships: []
      }
      news_generator_config: {
        Row: {
          created_at: string
          duplicate_similarity_threshold: number
          id: string
          max_age_days: number
          max_candidates: number
          min_category_distance: number
          target_news_count: number
          topic_repost_days: number
          topic_similarity_threshold: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duplicate_similarity_threshold?: number
          id?: string
          max_age_days?: number
          max_candidates?: number
          min_category_distance?: number
          target_news_count?: number
          topic_repost_days?: number
          topic_similarity_threshold?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duplicate_similarity_threshold?: number
          id?: string
          max_age_days?: number
          max_candidates?: number
          min_category_distance?: number
          target_news_count?: number
          topic_repost_days?: number
          topic_similarity_threshold?: number
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_bonus_pages: {
        Row: {
          cards: Json
          created_at: string
          id: string
          intro: string
          slug: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          cards?: Json
          created_at?: string
          id?: string
          intro: string
          slug: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          cards?: Json
          created_at?: string
          id?: string
          intro?: string
          slug?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_events: {
        Row: {
          created_at: string
          email_hash: string
          error_message: string | null
          event_type: string
          id: string
          ip_hash: string | null
          metadata: Json | null
          page_slug: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          email_hash: string
          error_message?: string | null
          event_type: string
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          page_slug?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          email_hash?: string
          error_message?: string | null
          event_type?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          page_slug?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      newsletter_rate_limit: {
        Row: {
          attempts: number
          created_at: string
          id: string
          ip_hash: string
          window_start: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          ip_hash: string
          window_start?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          ip_hash?: string
          window_start?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmed: boolean
          confirmed_at: string | null
          created_at: string
          email: string
          id: string
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          confirmed?: boolean
          confirmed_at?: string | null
          created_at?: string
          email: string
          id?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          confirmed?: boolean
          confirmed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      oportunidades: {
        Row: {
          abrangencia: string
          banca: string | null
          categoria: string
          conteudo_principal: string | null
          created_at: string
          created_by: string | null
          data_publicacao: string
          escolaridade: string
          escolaridades: string[]
          id: string
          link_edital: string | null
          meta_description: string | null
          meta_title: string | null
          orgao: string | null
          publicado: boolean
          published_at: string | null
          resumo_editorial: string | null
          situacao: string
          slug: string
          slug_locked: boolean
          tipo: string
          titulo: string
          updated_at: string
          updated_by: string | null
          visualizacoes: number
        }
        Insert: {
          abrangencia: string
          banca?: string | null
          categoria: string
          conteudo_principal?: string | null
          created_at?: string
          created_by?: string | null
          data_publicacao?: string
          escolaridade: string
          escolaridades?: string[]
          id?: string
          link_edital?: string | null
          meta_description?: string | null
          meta_title?: string | null
          orgao?: string | null
          publicado?: boolean
          published_at?: string | null
          resumo_editorial?: string | null
          situacao: string
          slug: string
          slug_locked?: boolean
          tipo: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
          visualizacoes?: number
        }
        Update: {
          abrangencia?: string
          banca?: string | null
          categoria?: string
          conteudo_principal?: string | null
          created_at?: string
          created_by?: string | null
          data_publicacao?: string
          escolaridade?: string
          escolaridades?: string[]
          id?: string
          link_edital?: string | null
          meta_description?: string | null
          meta_title?: string | null
          orgao?: string | null
          publicado?: boolean
          published_at?: string | null
          resumo_editorial?: string | null
          situacao?: string
          slug?: string
          slug_locked?: boolean
          tipo?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
          visualizacoes?: number
        }
        Relationships: []
      }
      oportunidades_slug_redirects: {
        Row: {
          created_at: string
          id: string
          old_slug: string
          oportunidade_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          old_slug: string
          oportunidade_id: string
        }
        Update: {
          created_at?: string
          id?: string
          old_slug?: string
          oportunidade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_slug_redirects_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_slug_redirects_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades_public"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          logo_url: string
          sort_order: number
          title: string
          updated_at: string
          updated_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          logo_url: string
          sort_order?: number
          title: string
          updated_at?: string
          updated_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string
          sort_order?: number
          title?: string
          updated_at?: string
          updated_by?: string | null
          url?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          attachment_url: string | null
          created_at: string
          created_by: string | null
          description: string
          icon_url: string | null
          id: string
          is_visible: boolean
          name: string
          sort_order: number
          tags: string[]
          updated_at: string
          updated_by: string | null
          url: string | null
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          icon_url?: string | null
          id?: string
          is_visible?: boolean
          name: string
          sort_order?: number
          tags?: string[]
          updated_at?: string
          updated_by?: string | null
          url?: string | null
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          icon_url?: string | null
          id?: string
          is_visible?: boolean
          name?: string
          sort_order?: number
          tags?: string[]
          updated_at?: string
          updated_by?: string | null
          url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      active_courses: {
        Row: {
          affiliate_link: string | null
          badge: Database["public"]["Enums"]["course_badge"] | null
          category: string | null
          created_at: string | null
          description: string | null
          dislikes: number | null
          downvotes: number | null
          duration: string | null
          id: string | null
          image_url: string | null
          institution: string | null
          is_active: boolean | null
          is_hidden: boolean | null
          level: string | null
          likes: number | null
          price: string | null
          rating: number | null
          students: number | null
          title: string | null
          updated_at: string | null
          upvotes: number | null
          views: number | null
          vote_score: number | null
        }
        Insert: {
          affiliate_link?: string | null
          badge?: Database["public"]["Enums"]["course_badge"] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          dislikes?: number | null
          downvotes?: number | null
          duration?: string | null
          id?: string | null
          image_url?: string | null
          institution?: string | null
          is_active?: boolean | null
          is_hidden?: boolean | null
          level?: string | null
          likes?: number | null
          price?: string | null
          rating?: number | null
          students?: number | null
          title?: string | null
          updated_at?: string | null
          upvotes?: number | null
          views?: number | null
          vote_score?: number | null
        }
        Update: {
          affiliate_link?: string | null
          badge?: Database["public"]["Enums"]["course_badge"] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          dislikes?: number | null
          downvotes?: number | null
          duration?: string | null
          id?: string | null
          image_url?: string | null
          institution?: string | null
          is_active?: boolean | null
          is_hidden?: boolean | null
          level?: string | null
          likes?: number | null
          price?: string | null
          rating?: number | null
          students?: number | null
          title?: string | null
          updated_at?: string | null
          upvotes?: number | null
          views?: number | null
          vote_score?: number | null
        }
        Relationships: []
      }
      active_partners: {
        Row: {
          display_order: number | null
          id: string | null
          is_active: boolean | null
          logo_url: string | null
          partner_url: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          display_order?: number | null
          id?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          partner_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          display_order?: number | null
          id?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          partner_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      atualizacoes_oportunidade_public: {
        Row: {
          created_at: string | null
          data_atualizacao: string | null
          id: string | null
          oportunidade_id: string | null
          texto: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atualizacoes_oportunidade_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atualizacoes_oportunidade_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades_public"
            referencedColumns: ["id"]
          },
        ]
      }
      course_suggestions_me: {
        Row: {
          created_at: string | null
          id: string | null
          is_anonymous: boolean | null
          status: string | null
          suggestion: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          status?: string | null
          suggestion?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          status?: string | null
          suggestion?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      course_suggestions_public: {
        Row: {
          is_anonymous: boolean | null
          status: string | null
          submission_date: string | null
          submitter_type: string | null
          suggestion_count: number | null
        }
        Relationships: []
      }
      courses_public: {
        Row: {
          affiliate_link: string | null
          badge: Database["public"]["Enums"]["course_badge"] | null
          category: string | null
          created_at: string | null
          description: string | null
          dislikes: number | null
          downvotes: number | null
          duration: string | null
          id: string | null
          image_url: string | null
          institution: string | null
          is_active: boolean | null
          is_hidden: boolean | null
          level: string | null
          likes: number | null
          price: string | null
          rating: number | null
          students: number | null
          title: string | null
          updated_at: string | null
          upvotes: number | null
          views: number | null
          vote_score: number | null
        }
        Insert: {
          affiliate_link?: string | null
          badge?: Database["public"]["Enums"]["course_badge"] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          dislikes?: number | null
          downvotes?: number | null
          duration?: string | null
          id?: string | null
          image_url?: string | null
          institution?: string | null
          is_active?: boolean | null
          is_hidden?: boolean | null
          level?: string | null
          likes?: number | null
          price?: string | null
          rating?: number | null
          students?: number | null
          title?: string | null
          updated_at?: string | null
          upvotes?: number | null
          views?: number | null
          vote_score?: number | null
        }
        Update: {
          affiliate_link?: string | null
          badge?: Database["public"]["Enums"]["course_badge"] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          dislikes?: number | null
          downvotes?: number | null
          duration?: string | null
          id?: string | null
          image_url?: string | null
          institution?: string | null
          is_active?: boolean | null
          is_hidden?: boolean | null
          level?: string | null
          likes?: number | null
          price?: string | null
          rating?: number | null
          students?: number | null
          title?: string | null
          updated_at?: string | null
          upvotes?: number | null
          views?: number | null
          vote_score?: number | null
        }
        Relationships: []
      }
      fontes_oportunidade_public: {
        Row: {
          id: string | null
          oportunidade_id: string | null
          source_date: string | null
          source_tipo: string | null
          source_title: string | null
          source_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fontes_oportunidade_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fontes_oportunidade_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades_public"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidades_public: {
        Row: {
          abrangencia: string | null
          banca: string | null
          categoria: string | null
          conteudo_principal: string | null
          created_at: string | null
          data_publicacao: string | null
          escolaridade: string | null
          escolaridades: string[] | null
          id: string | null
          link_edital: string | null
          meta_description: string | null
          meta_title: string | null
          orgao: string | null
          published_at: string | null
          resumo_editorial: string | null
          situacao: string | null
          slug: string | null
          tipo: string | null
          titulo: string | null
          updated_at: string | null
          visualizacoes: number | null
        }
        Insert: {
          abrangencia?: string | null
          banca?: string | null
          categoria?: string | null
          conteudo_principal?: string | null
          created_at?: string | null
          data_publicacao?: string | null
          escolaridade?: string | null
          escolaridades?: string[] | null
          id?: string | null
          link_edital?: string | null
          meta_description?: string | null
          meta_title?: string | null
          orgao?: string | null
          published_at?: string | null
          resumo_editorial?: string | null
          situacao?: string | null
          slug?: string | null
          tipo?: string | null
          titulo?: string | null
          updated_at?: string | null
          visualizacoes?: number | null
        }
        Update: {
          abrangencia?: string | null
          banca?: string | null
          categoria?: string | null
          conteudo_principal?: string | null
          created_at?: string | null
          data_publicacao?: string | null
          escolaridade?: string | null
          escolaridades?: string[] | null
          id?: string | null
          link_edital?: string | null
          meta_description?: string | null
          meta_title?: string | null
          orgao?: string | null
          published_at?: string | null
          resumo_editorial?: string | null
          situacao?: string | null
          slug?: string | null
          tipo?: string | null
          titulo?: string | null
          updated_at?: string | null
          visualizacoes?: number | null
        }
        Relationships: []
      }
      partners_public: {
        Row: {
          display_order: number | null
          id: string | null
          is_active: boolean | null
          logo_url: string | null
          partner_url: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          display_order?: number | null
          id?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          partner_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          display_order?: number | null
          id?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          partner_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tools_public: {
        Row: {
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string | null
          is_visible: boolean | null
          name: string | null
          sort_order: number | null
          tags: string[] | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string | null
          is_visible?: boolean | null
          name?: string | null
          sort_order?: number | null
          tags?: string[] | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string | null
          is_visible?: boolean | null
          name?: string | null
          sort_order?: number | null
          tags?: string[] | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_newsletter_events_180d: { Args: never; Returns: undefined }
      cleanup_newsletter_rate_limit: { Args: never; Returns: undefined }
      cleanup_newsletter_rate_limit_30d: { Args: never; Returns: undefined }
      cleanup_old_rate_limit_entries: { Args: never; Returns: undefined }
      get_brevo_config: {
        Args: never
        Returns: {
          allow_resend_welcome: boolean
          default_list_id: string
          default_tags: string[]
          error_message_already_subscribed: string
          error_message_generic: string
          opt_in_mode: string
          success_message_doi: string
          success_message_single: string
          webhook_url: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      course_badge: "trending" | "popular" | "community"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      course_badge: ["trending", "popular", "community"],
    },
  },
} as const
