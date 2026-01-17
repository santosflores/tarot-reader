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
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          session_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          session_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          session_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      horoscope_views: {
        Row: {
          clicked_tarot_cta: boolean | null
          horoscope_id: string
          id: string
          persona_id: string
          referrer: string | null
          session_duration_seconds: number | null
          user_agent: string | null
          viewed_at: string
          zodiac_sign: string
        }
        Insert: {
          clicked_tarot_cta?: boolean | null
          horoscope_id: string
          id?: string
          persona_id: string
          referrer?: string | null
          session_duration_seconds?: number | null
          user_agent?: string | null
          viewed_at?: string
          zodiac_sign: string
        }
        Update: {
          clicked_tarot_cta?: boolean | null
          horoscope_id?: string
          id?: string
          persona_id?: string
          referrer?: string | null
          session_duration_seconds?: number | null
          user_agent?: string | null
          viewed_at?: string
          zodiac_sign?: string
        }
        Relationships: [
          {
            foreignKeyName: "horoscope_views_horoscope_id_fkey"
            columns: ["horoscope_id"]
            isOneToOne: false
            referencedRelation: "horoscopes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horoscope_views_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      horoscopes: {
        Row: {
          content: string
          created_at: string
          id: string
          meta_description: string
          persona_id: string
          publish_date: string
          status: string
          title: string
          updated_at: string
          zodiac_sign: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          meta_description: string
          persona_id: string
          publish_date: string
          status?: string
          title: string
          updated_at?: string
          zodiac_sign: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          meta_description?: string
          persona_id?: string
          publish_date?: string
          status?: string
          title?: string
          updated_at?: string
          zodiac_sign?: string
        }
        Relationships: [
          {
            foreignKeyName: "horoscopes_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      personas: {
        Row: {
          avatar_url: string | null
          created_at: string
          description: string
          id: string
          name: string
          slug: string
          system_instruction: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          description: string
          id?: string
          name: string
          slug: string
          system_instruction: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          description?: string
          id?: string
          name?: string
          slug?: string
          system_instruction?: string
        }
        Relationships: []
      }
      reading_sessions: {
        Row: {
          created_at: string
          elevenlabs_conversation_id: string
          ended_at: string
          id: string
          metadata: Json | null
          started_at: string
          summary: string | null
          transcript: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          elevenlabs_conversation_id: string
          ended_at: string
          id?: string
          metadata?: Json | null
          started_at: string
          summary?: string | null
          transcript?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          elevenlabs_conversation_id?: string
          ended_at?: string
          id?: string
          metadata?: Json | null
          started_at?: string
          summary?: string | null
          transcript?: Json
          user_id?: string
        }
        Relationships: []
      }
      tarot_card_meanings: {
        Row: {
          id: string
          name: string
          arcana: string
          number: number | null
          suit: string | null
          rank: string | null
          element: string
          zodiac_sign: string | null
          content: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name: string
          arcana: string
          number?: number | null
          suit?: string | null
          rank?: string | null
          element: string
          zodiac_sign?: string | null
          content: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          arcana?: string
          number?: number | null
          suit?: string | null
          rank?: string | null
          element?: string
          zodiac_sign?: string | null
          content?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          bio: string | null
          birthdate: string | null
          created_at: string
          credits_balance: number
          display_name: string | null
          id: string
          preferences: Json | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          birthdate?: string | null
          created_at?: string
          credits_balance?: number
          display_name?: string | null
          id: string
          preferences?: Json | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          birthdate?: string | null
          created_at?: string
          credits_balance?: number
          display_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: { p_amount: number; p_description?: string; p_user_id: string }
        Returns: Json
      }
      deduct_credits: {
        Args: {
          p_amount: number
          p_description?: string
          p_session_id?: string
          p_user_id: string
        }
        Returns: {
          error_message: string
          new_balance: number
          success: boolean
        }[]
      }
      get_daily_horoscope_stats: {
        Args: Record<string, never>
        Returns: {
          publish_date: string
          total_views: number
          conversions: number
          avg_seconds: number
        }[]
      }
      get_horoscope_sign_stats: {
        Args: Record<string, never>
        Returns: {
          zodiac_sign: string
          views: number
        }[]
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
