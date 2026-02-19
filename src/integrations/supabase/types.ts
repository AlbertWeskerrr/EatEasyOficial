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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      custom_foods: {
        Row: {
          alergenicos: string[] | null
          calorias: number
          carboidratos: number
          categoria: string
          created_at: string | null
          dietas_incompativeis: string[] | null
          gorduras: number
          id: string
          is_favorite: boolean | null
          marca: string | null
          nome: string
          porcao_descricao: string | null
          porcao_tamanho: number
          porcao_unidade: string
          proteinas: number
          subcategoria: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alergenicos?: string[] | null
          calorias: number
          carboidratos: number
          categoria: string
          created_at?: string | null
          dietas_incompativeis?: string[] | null
          gorduras: number
          id?: string
          is_favorite?: boolean | null
          marca?: string | null
          nome: string
          porcao_descricao?: string | null
          porcao_tamanho?: number
          porcao_unidade?: string
          proteinas: number
          subcategoria: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alergenicos?: string[] | null
          calorias?: number
          carboidratos?: number
          categoria?: string
          created_at?: string | null
          dietas_incompativeis?: string[] | null
          gorduras?: number
          id?: string
          is_favorite?: boolean | null
          marca?: string | null
          nome?: string
          porcao_descricao?: string | null
          porcao_tamanho?: number
          porcao_unidade?: string
          proteinas?: number
          subcategoria?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dietary_restrictions: {
        Row: {
          alternatives: string[] | null
          category: Database["public"]["Enums"]["restriction_category"]
          code: string
          color: string
          created_at: string | null
          description: string | null
          icon: string
          id: string
          keywords: string[]
          name: string
        }
        Insert: {
          alternatives?: string[] | null
          category: Database["public"]["Enums"]["restriction_category"]
          code: string
          color: string
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          keywords?: string[]
          name: string
        }
        Update: {
          alternatives?: string[] | null
          category?: Database["public"]["Enums"]["restriction_category"]
          code?: string
          color?: string
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          keywords?: string[]
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          alergias: string | null
          aviso_carboidrato_alto: boolean | null
          aviso_macros_desequilibrio: boolean | null
          aviso_proteina_baixa: boolean | null
          created_at: string | null
          email: string
          email_confirmado: boolean | null
          email_hash: string | null
          frequencia_exercicio: number | null
          id: string
          idade: number | null
          legal_accepted_at: string | null
          legal_version: string
          macros_atualizados_em: string | null
          macros_carboidrato_pct: number | null
          macros_lipidio_pct: number | null
          macros_proteina_pct: number | null
          nivel_atividade: string | null
          nome: string
          objetivo: string | null
          perfil_completo: boolean | null
          pratica_exercicio: boolean | null
          preferencias_alimentares: string | null
          questionario_respondido_em: string | null
          restricoes_alimentares: string | null
          sexo: string | null
          tema_cor: string | null
          tipo_exercicio: string | null
          ultimo_login: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alergias?: string | null
          aviso_carboidrato_alto?: boolean | null
          aviso_macros_desequilibrio?: boolean | null
          aviso_proteina_baixa?: boolean | null
          created_at?: string | null
          email: string
          email_confirmado?: boolean | null
          email_hash?: string | null
          frequencia_exercicio?: number | null
          id?: string
          idade?: number | null
          legal_accepted_at?: string | null
          legal_version?: string
          macros_atualizados_em?: string | null
          macros_carboidrato_pct?: number | null
          macros_lipidio_pct?: number | null
          macros_proteina_pct?: number | null
          nivel_atividade?: string | null
          nome: string
          objetivo?: string | null
          perfil_completo?: boolean | null
          pratica_exercicio?: boolean | null
          preferencias_alimentares?: string | null
          questionario_respondido_em?: string | null
          restricoes_alimentares?: string | null
          sexo?: string | null
          tema_cor?: string | null
          tipo_exercicio?: string | null
          ultimo_login?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alergias?: string | null
          aviso_carboidrato_alto?: boolean | null
          aviso_macros_desequilibrio?: boolean | null
          aviso_proteina_baixa?: boolean | null
          created_at?: string | null
          email?: string
          email_confirmado?: boolean | null
          email_hash?: string | null
          frequencia_exercicio?: number | null
          id?: string
          idade?: number | null
          legal_accepted_at?: string | null
          legal_version?: string
          macros_atualizados_em?: string | null
          macros_carboidrato_pct?: number | null
          macros_lipidio_pct?: number | null
          macros_proteina_pct?: number | null
          nivel_atividade?: string | null
          nome?: string
          objetivo?: string | null
          perfil_completo?: boolean | null
          pratica_exercicio?: boolean | null
          preferencias_alimentares?: string | null
          questionario_respondido_em?: string | null
          restricoes_alimentares?: string | null
          sexo?: string | null
          tema_cor?: string | null
          tipo_exercicio?: string | null
          ultimo_login?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_diet_states: {
        Row: {
          state: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          state?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          state?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_health_data: {
        Row: {
          altura_cm: number | null
          calorias_diarias: number | null
          circunferencia_abdominal_cm: number | null
          created_at: string | null
          id: string
          imc: number | null
          peso_kg: number | null
          tmb: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          altura_cm?: number | null
          calorias_diarias?: number | null
          circunferencia_abdominal_cm?: number | null
          created_at?: string | null
          id?: string
          imc?: number | null
          peso_kg?: number | null
          tmb?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          altura_cm?: number | null
          calorias_diarias?: number | null
          circunferencia_abdominal_cm?: number | null
          created_at?: string | null
          id?: string
          imc?: number | null
          peso_kg?: number | null
          tmb?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_health_history: {
        Row: {
          altura_cm: number | null
          calorias_diarias: number | null
          circunferencia_abdominal_cm: number | null
          id: string
          imc: number | null
          peso_kg: number | null
          recorded_at: string | null
          source: string
          tmb: number | null
          user_id: string
        }
        Insert: {
          altura_cm?: number | null
          calorias_diarias?: number | null
          circunferencia_abdominal_cm?: number | null
          id?: string
          imc?: number | null
          peso_kg?: number | null
          recorded_at?: string | null
          source?: string
          tmb?: number | null
          user_id: string
        }
        Update: {
          altura_cm?: number | null
          calorias_diarias?: number | null
          circunferencia_abdominal_cm?: number | null
          id?: string
          imc?: number | null
          peso_kg?: number | null
          recorded_at?: string | null
          source?: string
          tmb?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_macro_plans: {
        Row: {
          avisos: Json | null
          calorias_alvo: number
          carboidrato_g: number
          carboidrato_pct: number
          created_at: string | null
          fibra_g: number
          fonte_recomendacao: string | null
          gordura_g: number
          gordura_pct: number
          id: string
          is_customized: boolean | null
          objetivo: string
          proteina_g: number
          proteina_g_kg: number | null
          proteina_pct: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avisos?: Json | null
          calorias_alvo: number
          carboidrato_g: number
          carboidrato_pct?: number
          created_at?: string | null
          fibra_g?: number
          fonte_recomendacao?: string | null
          gordura_g: number
          gordura_pct?: number
          id?: string
          is_customized?: boolean | null
          objetivo: string
          proteina_g: number
          proteina_g_kg?: number | null
          proteina_pct?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avisos?: Json | null
          calorias_alvo?: number
          carboidrato_g?: number
          carboidrato_pct?: number
          created_at?: string | null
          fibra_g?: number
          fonte_recomendacao?: string | null
          gordura_g?: number
          gordura_pct?: number
          id?: string
          is_customized?: boolean | null
          objetivo?: string
          proteina_g?: number
          proteina_g_kg?: number | null
          proteina_pct?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_restrictions: {
        Row: {
          created_at: string | null
          id: string
          restriction_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          restriction_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          restriction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_restrictions_restriction_id_fkey"
            columns: ["restriction_id"]
            isOneToOne: false
            referencedRelation: "dietary_restrictions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      hash_email: { Args: { email_input: string }; Returns: string }
    }
    Enums: {
      restriction_category:
        | "allergy"
        | "intolerance"
        | "health"
        | "dietary"
        | "religious"
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
      restriction_category: [
        "allergy",
        "intolerance",
        "health",
        "dietary",
        "religious",
      ],
    },
  },
} as const
