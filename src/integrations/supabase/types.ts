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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          role: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      atas: {
        Row: {
          created_at: string
          id: string
          meeting_date: string
          meeting_type: string
          name: string
          pdf_url: string
          updated_at: string
          year_group: string
        }
        Insert: {
          created_at?: string
          id?: string
          meeting_date: string
          meeting_type: string
          name: string
          pdf_url: string
          updated_at?: string
          year_group: string
        }
        Update: {
          created_at?: string
          id?: string
          meeting_date?: string
          meeting_type?: string
          name?: string
          pdf_url?: string
          updated_at?: string
          year_group?: string
        }
        Relationships: []
      }
      calendars: {
        Row: {
          created_at: string
          display_order: number
          id: string
          name: string
          pdf_url: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          name: string
          pdf_url: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          pdf_url?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      event_photos: {
        Row: {
          created_at: string
          event_id: string
          id: string
          photo_order: number
          photo_url: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          photo_order?: number
          photo_url: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          photo_order?: number
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          event_date: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_date: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      history_documents: {
        Row: {
          created_at: string
          id: string
          pdf_url: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          pdf_url: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          pdf_url?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      laboratories: {
        Row: {
          acronym: string
          chief_alternative_email: string | null
          chief_name: string
          chief_user_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          photo1_legend: string | null
          photo1_url: string | null
          photo2_legend: string | null
          photo2_url: string | null
          photo3_legend: string | null
          photo3_url: string | null
          pnipe_address: string | null
          updated_at: string
        }
        Insert: {
          acronym: string
          chief_alternative_email?: string | null
          chief_name: string
          chief_user_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          photo1_legend?: string | null
          photo1_url?: string | null
          photo2_legend?: string | null
          photo2_url?: string | null
          photo3_legend?: string | null
          photo3_url?: string | null
          pnipe_address?: string | null
          updated_at?: string
        }
        Update: {
          acronym?: string
          chief_alternative_email?: string | null
          chief_name?: string
          chief_user_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          photo1_legend?: string | null
          photo1_url?: string | null
          photo2_legend?: string | null
          photo2_url?: string | null
          photo3_legend?: string | null
          photo3_url?: string | null
          pnipe_address?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "laboratories_chief_user_id_fkey"
            columns: ["chief_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      laiga_equipment: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_available: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_available?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_available?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      laiga_equipments: {
        Row: {
          acquisition_date: string | null
          brand: string | null
          created_at: string
          description: string | null
          id: string
          last_maintenance: string | null
          location: string | null
          model: string | null
          name: string
          next_maintenance: string | null
          observations: string | null
          responsible_person: string | null
          serial_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          acquisition_date?: string | null
          brand?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_maintenance?: string | null
          location?: string | null
          model?: string | null
          name: string
          next_maintenance?: string | null
          observations?: string | null
          responsible_person?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          acquisition_date?: string | null
          brand?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_maintenance?: string | null
          location?: string | null
          model?: string | null
          name?: string
          next_maintenance?: string | null
          observations?: string | null
          responsible_person?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          content: string
          cover_photo_number: number | null
          created_at: string
          external_link: string | null
          id: string
          news_position: string
          pdf1_title: string | null
          pdf1_url: string | null
          pdf2_title: string | null
          pdf2_url: string | null
          pdf3_title: string | null
          pdf3_url: string | null
          photo1_url: string | null
          photo2_url: string | null
          photo3_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          cover_photo_number?: number | null
          created_at?: string
          external_link?: string | null
          id?: string
          news_position: string
          pdf1_title?: string | null
          pdf1_url?: string | null
          pdf2_title?: string | null
          pdf2_url?: string | null
          pdf3_title?: string | null
          pdf3_url?: string | null
          photo1_url?: string | null
          photo2_url?: string | null
          photo3_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          cover_photo_number?: number | null
          created_at?: string
          external_link?: string | null
          id?: string
          news_position?: string
          pdf1_title?: string | null
          pdf1_url?: string | null
          pdf2_title?: string | null
          pdf2_url?: string | null
          pdf3_title?: string | null
          pdf3_url?: string | null
          photo1_url?: string | null
          photo2_url?: string | null
          photo3_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      regulations: {
        Row: {
          created_at: string
          id: string
          name: string
          pdf_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          pdf_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          pdf_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      repair_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
          notes: string | null
          problem_description: string
          problem_type: string
          resolved_at: string | null
          sobrenome: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nome: string
          notes?: string | null
          problem_description: string
          problem_type: string
          resolved_at?: string | null
          sobrenome: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
          notes?: string | null
          problem_description?: string
          problem_type?: string
          resolved_at?: string | null
          sobrenome?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      research_projects: {
        Row: {
          coordinator: string
          created_at: string
          funding_agency: string
          id: string
          title: string
          updated_at: string
          validity_period: string
          vice_coordinator: string | null
        }
        Insert: {
          coordinator: string
          created_at?: string
          funding_agency: string
          id?: string
          title: string
          updated_at?: string
          validity_period: string
          vice_coordinator?: string | null
        }
        Update: {
          coordinator?: string
          created_at?: string
          funding_agency?: string
          id?: string
          title?: string
          updated_at?: string
          validity_period?: string
          vice_coordinator?: string | null
        }
        Relationships: []
      }
      researchers: {
        Row: {
          created_at: string
          description: string | null
          email: string | null
          id: string
          institution: string
          is_chief: boolean
          lattes_link: string | null
          name: string
          program: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          institution?: string
          is_chief?: boolean
          lattes_link?: string | null
          name: string
          program: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          institution?: string
          is_chief?: boolean
          lattes_link?: string | null
          name?: string
          program?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string
          email: string
          equipamento: string | null
          id: string
          inicio: string
          nome: string
          sobrenome: string
          status: string
          termino: string
          tipo_reserva: string
          updated_at: string
          uso: string
        }
        Insert: {
          created_at?: string
          email: string
          equipamento?: string | null
          id?: string
          inicio: string
          nome: string
          sobrenome: string
          status?: string
          termino: string
          tipo_reserva: string
          updated_at?: string
          uso: string
        }
        Update: {
          created_at?: string
          email?: string
          equipamento?: string | null
          id?: string
          inicio?: string
          nome?: string
          sobrenome?: string
          status?: string
          termino?: string
          tipo_reserva?: string
          updated_at?: string
          uso?: string
        }
        Relationships: []
      }
      scientific_publications: {
        Row: {
          article_title: string
          authors: string
          created_at: string
          id: string
          journal_name: string
          pages: string
          updated_at: string
          volume: string
          year: string
        }
        Insert: {
          article_title: string
          authors: string
          created_at?: string
          id?: string
          journal_name: string
          pages: string
          updated_at?: string
          volume: string
          year: string
        }
        Update: {
          article_title?: string
          authors?: string
          created_at?: string
          id?: string
          journal_name?: string
          pages?: string
          updated_at?: string
          volume?: string
          year?: string
        }
        Relationships: []
      }
      senior_researchers: {
        Row: {
          created_at: string
          id: string
          name: string
          researcher_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          researcher_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          researcher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "senior_researchers_researcher_id_fkey"
            columns: ["researcher_id"]
            isOneToOne: false
            referencedRelation: "researchers"
            referencedColumns: ["id"]
          },
        ]
      }
      tcc_geofisica: {
        Row: {
          created_at: string
          id: string
          pdf_url: string
          student_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          pdf_url: string
          student_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          pdf_url?: string
          student_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          description: string | null
          email: string
          first_name: string
          full_name: string
          id: string
          institution: string
          phone: string
          photo_url: string | null
          public_id: string | null
          researcher_route: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          email: string
          first_name: string
          full_name: string
          id?: string
          institution: string
          phone: string
          photo_url?: string | null
          public_id?: string | null
          researcher_route?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string
          first_name?: string
          full_name?: string
          id?: string
          institution?: string
          phone?: string
          photo_url?: string | null
          public_id?: string | null
          researcher_route?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      visitor_locations: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          latitude: number
          longitude: number
          unique_ip_hashes: string[] | null
          updated_at: string
          visitor_count: number
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          unique_ip_hashes?: string[] | null
          updated_at?: string
          visitor_count?: number
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          unique_ip_hashes?: string[] | null
          updated_at?: string
          visitor_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_profile_duplicates: {
        Args: { _email: string; _full_name: string }
        Returns: Json
      }
      create_admin_from_panel: {
        Args: { _email: string; _role?: string }
        Returns: Json
      }
      create_admin_user: {
        Args: { _email: string; _password: string; _role?: string }
        Returns: Json
      }
      delete_user_complete: {
        Args: { _user_profile_id: string }
        Returns: Json
      }
      delete_user_profile: { Args: { _profile_id: string }; Returns: Json }
      find_user_profile_by_name: {
        Args: { _search_name: string }
        Returns: {
          email: string
          first_name: string
          full_name: string
          id: string
          institution: string
          phone: string
          photo_url: string
          researcher_route: string
          user_id: string
        }[]
      }
      generate_public_id: { Args: never; Returns: string }
      get_admin_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      list_all_user_profiles: {
        Args: never
        Returns: {
          email: string
          full_name: string
          id: string
          institution: string
          phone: string
          public_id: string
          researcher_route: string
          user_id: string
        }[]
      }
      reset_user_keep_profile_data: {
        Args: { _user_profile_id: string }
        Returns: Json
      }
      restore_user_profile: {
        Args: {
          _email: string
          _first_name: string
          _full_name: string
          _id: string
          _institution: string
          _phone: string
          _researcher_route: string
          _user_id: string
        }
        Returns: Json
      }
      set_researcher_as_chief: {
        Args: { _program: string; _researcher_id: string }
        Returns: undefined
      }
      sync_auth_users_to_profiles: { Args: never; Returns: Json }
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
