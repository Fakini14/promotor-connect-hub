export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      adiantamentos: {
        Row: {
          aprovado_por: string | null
          created_at: string
          data_aprovacao: string | null
          data_pagamento: string | null
          data_solicitacao: string
          id: string
          motivo: string | null
          observacoes_admin: string | null
          promotor_id: string
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          aprovado_por?: string | null
          created_at?: string
          data_aprovacao?: string | null
          data_pagamento?: string | null
          data_solicitacao?: string
          id?: string
          motivo?: string | null
          observacoes_admin?: string | null
          promotor_id: string
          status?: string
          updated_at?: string
          valor: number
        }
        Update: {
          aprovado_por?: string | null
          created_at?: string
          data_aprovacao?: string | null
          data_pagamento?: string | null
          data_solicitacao?: string
          id?: string
          motivo?: string | null
          observacoes_admin?: string | null
          promotor_id?: string
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "adiantamentos_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adiantamentos_promotor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      atestados: {
        Row: {
          aprovado_por: string | null
          arquivo_url: string
          cid: string | null
          created_at: string
          data_aprovacao: string | null
          data_fim: string
          data_inicio: string
          dias_afastamento: number | null
          id: string
          medico_crm: string | null
          medico_nome: string | null
          motivo: string
          observacoes_admin: string | null
          observacoes_promotor: string | null
          promotor_id: string
          status: string
          tipo: string | null
          updated_at: string
        }
        Insert: {
          aprovado_por?: string | null
          arquivo_url: string
          cid?: string | null
          created_at?: string
          data_aprovacao?: string | null
          data_fim: string
          data_inicio: string
          dias_afastamento?: number | null
          id?: string
          medico_crm?: string | null
          medico_nome?: string | null
          motivo: string
          observacoes_admin?: string | null
          observacoes_promotor?: string | null
          promotor_id: string
          status?: string
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          aprovado_por?: string | null
          arquivo_url?: string
          cid?: string | null
          created_at?: string
          data_aprovacao?: string | null
          data_fim?: string
          data_inicio?: string
          dias_afastamento?: number | null
          id?: string
          medico_crm?: string | null
          medico_nome?: string | null
          motivo?: string
          observacoes_admin?: string | null
          observacoes_promotor?: string | null
          promotor_id?: string
          status?: string
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atestados_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      avisos: {
        Row: {
          arquivo_url: string | null
          ativo: boolean | null
          conteudo: string
          created_at: string | null
          criado_por: string | null
          data_fim: string | null
          data_inicio: string | null
          destinatarios: string[] | null
          id: string
          tipo: string | null
          titulo: string
        }
        Insert: {
          arquivo_url?: string | null
          ativo?: boolean | null
          conteudo: string
          created_at?: string | null
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          destinatarios?: string[] | null
          id?: string
          tipo?: string | null
          titulo: string
        }
        Update: {
          arquivo_url?: string | null
          ativo?: boolean | null
          conteudo?: string
          created_at?: string | null
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          destinatarios?: string[] | null
          id?: string
          tipo?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "avisos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comprovantes: {
        Row: {
          arquivo_nome: string | null
          arquivo_tamanho: number | null
          arquivo_tipo: string | null
          arquivo_url: string
          created_at: string | null
          descricao: string | null
          id: string
          registro_id: string
          tipo_registro: string
          uploaded_by: string | null
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_tamanho?: number | null
          arquivo_tipo?: string | null
          arquivo_url: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          registro_id: string
          tipo_registro: string
          uploaded_by?: string | null
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_tamanho?: number | null
          arquivo_tipo?: string | null
          arquivo_url?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          registro_id?: string
          tipo_registro?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comprovantes_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string | null
          data_leitura: string | null
          id: string
          lida: boolean | null
          link_acao: string | null
          mensagem: string | null
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          data_leitura?: string | null
          id?: string
          lida?: boolean | null
          link_acao?: string | null
          mensagem?: string | null
          tipo: string
          titulo: string
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          data_leitura?: string | null
          id?: string
          lida?: boolean | null
          link_acao?: string | null
          mensagem?: string | null
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_compra: {
        Row: {
          aprovado_por: string | null
          created_at: string | null
          data_aprovacao: string | null
          data_necessidade: string | null
          descricao: string
          id: string
          justificativa: string
          observacoes_admin: string | null
          promotor_id: string
          status: string | null
          tipo_despesa: string | null
          updated_at: string | null
          urgencia: string | null
          valor_aprovado: number | null
          valor_estimado: number | null
        }
        Insert: {
          aprovado_por?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          data_necessidade?: string | null
          descricao: string
          id?: string
          justificativa: string
          observacoes_admin?: string | null
          promotor_id: string
          status?: string | null
          tipo_despesa?: string | null
          updated_at?: string | null
          urgencia?: string | null
          valor_aprovado?: number | null
          valor_estimado?: number | null
        }
        Update: {
          aprovado_por?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          data_necessidade?: string | null
          descricao?: string
          id?: string
          justificativa?: string
          observacoes_admin?: string | null
          promotor_id?: string
          status?: string | null
          tipo_despesa?: string | null
          updated_at?: string | null
          urgencia?: string | null
          valor_aprovado?: number | null
          valor_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_compra_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_compra_promotor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agencia: string | null
          ativo: boolean
          banco: string | null
          conta: string | null
          cpf: string | null
          created_at: string
          email: string
          empresa: string | null
          id: string
          nome_completo: string
          pix_chave: string | null
          pix_tipo: string | null
          telefone: string | null
          tipo_usuario: string
          updated_at: string
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean
          banco?: string | null
          conta?: string | null
          cpf?: string | null
          created_at?: string
          email: string
          empresa?: string | null
          id: string
          nome_completo: string
          pix_chave?: string | null
          pix_tipo?: string | null
          telefone?: string | null
          tipo_usuario: string
          updated_at?: string
        }
        Update: {
          agencia?: string | null
          ativo?: boolean
          banco?: string | null
          conta?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          empresa?: string | null
          id?: string
          nome_completo?: string
          pix_chave?: string | null
          pix_tipo?: string | null
          telefone?: string | null
          tipo_usuario?: string
          updated_at?: string
        }
        Relationships: []
      }
      reembolsos_km: {
        Row: {
          aprovado_por: string | null
          created_at: string | null
          data_aprovacao: string | null
          data_fim: string
          data_inicio: string
          destino: string
          id: string
          km_ida: number | null
          km_total: number | null
          km_volta: number | null
          motivo_deslocamento: string | null
          observacoes_admin: string | null
          observacoes_promotor: string | null
          origem: string
          promotor_id: string
          status: string | null
          updated_at: string | null
          valor_por_km: number | null
          valor_total: number | null
        }
        Insert: {
          aprovado_por?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          data_fim: string
          data_inicio: string
          destino: string
          id?: string
          km_ida?: number | null
          km_total?: number | null
          km_volta?: number | null
          motivo_deslocamento?: string | null
          observacoes_admin?: string | null
          observacoes_promotor?: string | null
          origem: string
          promotor_id: string
          status?: string | null
          updated_at?: string | null
          valor_por_km?: number | null
          valor_total?: number | null
        }
        Update: {
          aprovado_por?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          data_fim?: string
          data_inicio?: string
          destino?: string
          id?: string
          km_ida?: number | null
          km_total?: number | null
          km_volta?: number | null
          motivo_deslocamento?: string | null
          observacoes_admin?: string | null
          observacoes_promotor?: string | null
          origem?: string
          promotor_id?: string
          status?: string | null
          updated_at?: string | null
          valor_por_km?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reembolsos_km_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reembolsos_km_promotor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vale_refeicao: {
        Row: {
          aprovado_por: string | null
          created_at: string
          data: string
          id: string
          justificativa: string | null
          local_refeicao: string | null
          observacoes_admin: string | null
          periodo: string | null
          promotor_id: string
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          aprovado_por?: string | null
          created_at?: string
          data?: string
          id?: string
          justificativa?: string | null
          local_refeicao?: string | null
          observacoes_admin?: string | null
          periodo?: string | null
          promotor_id: string
          status?: string
          updated_at?: string
          valor?: number
        }
        Update: {
          aprovado_por?: string | null
          created_at?: string
          data?: string
          id?: string
          justificativa?: string | null
          local_refeicao?: string | null
          observacoes_admin?: string | null
          periodo?: string | null
          promotor_id?: string
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "vale_refeicao_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vale_refeicao_promotor_id_fkey"
            columns: ["promotor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      promover_usuario_admin: {
        Args: { usuario_id: string; novo_tipo: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const