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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          date: string
          id: number
          modality_id: number
          observation: string | null
          organization_id: number
          status: string
          student_id: number
          unit_id: number
          updated_at: string
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date: string
          id?: number
          modality_id: number
          observation?: string | null
          organization_id: number
          status: string
          student_id: number
          unit_id: number
          updated_at?: string
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          date?: string
          id?: number
          modality_id?: number
          observation?: string | null
          organization_id?: number
          status?: string
          student_id?: number
          unit_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_modality_id_fkey"
            columns: ["modality_id"]
            isOneToOne: false
            referencedRelation: "modalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      charges: {
        Row: {
          created_at: string
          description: string | null
          due_date: string
          id: number
          issue_date: string
          observation: string | null
          organization_id: number
          status: string
          student_id: number
          student_plan_id: number
          unit_id: number
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date: string
          id?: number
          issue_date: string
          observation?: string | null
          organization_id: number
          status: string
          student_id: number
          student_plan_id: number
          unit_id: number
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string
          id?: number
          issue_date?: string
          observation?: string | null
          organization_id?: number
          status?: string
          student_id?: number
          student_plan_id?: number
          unit_id?: number
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "charges_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_student_plan_id_fkey"
            columns: ["student_plan_id"]
            isOneToOne: false
            referencedRelation: "student_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_results: {
        Row: {
          created_at: string
          evaluation_id: number
          id: number
          metric: string
          observation: string | null
          unit_of_measure: string | null
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          evaluation_id: number
          id?: number
          metric: string
          observation?: string | null
          unit_of_measure?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          evaluation_id?: number
          id?: number
          metric?: string
          observation?: string | null
          unit_of_measure?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_results_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          created_at: string
          date: string
          id: number
          modality_id: number
          organization_id: number
          responsible_user_id: string
          student_id: number
          type: string
          unit_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: number
          modality_id: number
          organization_id: number
          responsible_user_id: string
          student_id: number
          type: string
          unit_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: number
          modality_id?: number
          organization_id?: number
          responsible_user_id?: string
          student_id?: number
          type?: string
          unit_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_modality_id_fkey"
            columns: ["modality_id"]
            isOneToOne: false
            referencedRelation: "modalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_responsible_user_id_fkey"
            columns: ["responsible_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      modalities: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          status: string
          unit_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          status?: string
          unit_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          status?: string
          unit_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modalities_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          cep: string | null
          city: string | null
          cnpj: string | null
          complement: string | null
          created_at: string
          email: string | null
          id: number
          logo: string | null
          name: string
          neighborhood: string | null
          number: string | null
          phone: string | null
          state: string | null
          status: string
          street: string | null
          trade_name: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          complement?: string | null
          created_at?: string
          email?: string | null
          id?: number
          logo?: string | null
          name: string
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          state?: string | null
          status?: string
          street?: string | null
          trade_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          complement?: string | null
          created_at?: string
          email?: string | null
          id?: number
          logo?: string | null
          name?: string
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          state?: string | null
          status?: string
          street?: string | null
          trade_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_paid: number
          charge_id: number
          created_at: string
          id: number
          observation: string | null
          payment_date: string
          payment_method: string
          updated_at: string
        }
        Insert: {
          amount_paid: number
          charge_id: number
          created_at?: string
          id?: number
          observation?: string | null
          payment_date: string
          payment_method: string
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          charge_id?: number
          created_at?: string
          id?: number
          observation?: string | null
          payment_date?: string
          payment_method?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_charge_id_fkey"
            columns: ["charge_id"]
            isOneToOne: false
            referencedRelation: "charges"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          organization_id: number
          periodicity: string
          status: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          organization_id: number
          periodicity: string
          status?: string
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          organization_id?: number
          periodicity?: string
          status?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      student_modality_units: {
        Row: {
          created_at: string
          end_date: string | null
          id: number
          modality_id: number
          observation: string | null
          start_date: string
          status: string
          student_id: number
          unit_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: number
          modality_id: number
          observation?: string | null
          start_date: string
          status?: string
          student_id: number
          unit_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: number
          modality_id?: number
          observation?: string | null
          start_date?: string
          status?: string
          student_id?: number
          unit_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_modality_units_modality_id_fkey"
            columns: ["modality_id"]
            isOneToOne: false
            referencedRelation: "modalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_modality_units_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_modality_units_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      student_plans: {
        Row: {
          created_at: string
          end_date: string | null
          id: number
          observation: string | null
          plan_id: number
          start_date: string
          status: string
          student_id: number
          unit_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: number
          observation?: string | null
          plan_id: number
          start_date: string
          status?: string
          student_id: number
          unit_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: number
          observation?: string | null
          plan_id?: number
          start_date?: string
          status?: string
          student_id?: number
          unit_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_plans_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          birth_date: string
          cep: string | null
          city: string | null
          complement: string | null
          cpf: string | null
          created_at: string
          email: string | null
          full_name: string
          id: number
          neighborhood: string | null
          number: string | null
          organization_id: number
          phone: string | null
          photo: string | null
          sex: string | null
          social_name: string | null
          sports_notes: string | null
          start_date: string | null
          state: string | null
          status: string
          street: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          birth_date: string
          cep?: string | null
          city?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: number
          neighborhood?: string | null
          number?: string | null
          organization_id: number
          phone?: string | null
          photo?: string | null
          sex?: string | null
          social_name?: string | null
          sports_notes?: string | null
          start_date?: string | null
          state?: string | null
          status?: string
          street?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          birth_date?: string
          cep?: string | null
          city?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: number
          neighborhood?: string | null
          number?: string | null
          organization_id?: number
          phone?: string | null
          photo?: string | null
          sex?: string | null
          social_name?: string | null
          sports_notes?: string | null
          start_date?: string | null
          state?: string | null
          status?: string
          street?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      training_exercises: {
        Row: {
          created_at: string
          duration: number | null
          exercise_name: string
          id: number
          intensity: string | null
          load: number | null
          observations: string | null
          order: number
          repetitions: number | null
          rest_time: number | null
          sets: number | null
          training_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          exercise_name: string
          id?: number
          intensity?: string | null
          load?: number | null
          observations?: string | null
          order: number
          repetitions?: number | null
          rest_time?: number | null
          sets?: number | null
          training_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          exercise_name?: string
          id?: number
          intensity?: string | null
          load?: number | null
          observations?: string | null
          order?: number
          repetitions?: number | null
          rest_time?: number | null
          sets?: number | null
          training_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_exercises_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: number
          name: string
          objective: string | null
          observations: string | null
          start_date: string | null
          status: string
          student_modality_unit_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: number
          name: string
          objective?: string | null
          observations?: string | null
          start_date?: string | null
          status?: string
          student_modality_unit_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: number
          name?: string
          objective?: string | null
          observations?: string | null
          start_date?: string | null
          status?: string
          student_modality_unit_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainings_student_modality_unit_id_fkey"
            columns: ["student_modality_unit_id"]
            isOneToOne: false
            referencedRelation: "student_modality_units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          cep: string | null
          city: string | null
          code: string | null
          complement: string | null
          created_at: string
          email: string | null
          id: number
          is_main: boolean
          logo: string | null
          name: string
          neighborhood: string | null
          number: string | null
          organization_id: number
          phone: string | null
          state: string | null
          status: string
          street: string | null
          updated_at: string
        }
        Insert: {
          cep?: string | null
          city?: string | null
          code?: string | null
          complement?: string | null
          created_at?: string
          email?: string | null
          id?: number
          is_main?: boolean
          logo?: string | null
          name: string
          neighborhood?: string | null
          number?: string | null
          organization_id: number
          phone?: string | null
          state?: string | null
          status?: string
          street?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string | null
          city?: string | null
          code?: string | null
          complement?: string | null
          created_at?: string
          email?: string | null
          id?: number
          is_main?: boolean
          logo?: string | null
          name?: string
          neighborhood?: string | null
          number?: string | null
          organization_id?: number
          phone?: string | null
          state?: string | null
          status?: string
          street?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          created_at: string
          email: string
          id: string
          last_access_at: string | null
          name: string
          organization_id: number
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email: string
          id: string
          last_access_at?: string | null
          name: string
          organization_id: number
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string
          id?: string
          last_access_at?: string | null
          name?: string
          organization_id?: number
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_organization_id: { Args: never; Returns: number }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
