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
      applications: {
        Row: {
          candidate_id: string
          cover_note: string | null
          created_at: string
          id: string
          job_id: string
          status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          candidate_id: string
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id: string
          status?: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          candidate_id?: string
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id?: string
          status?: Database["public"]["Enums"]["application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          profile_id: string
          role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          profile_id: string
          role: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          profile_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          industry: string | null
          location: string | null
          name: string
          size: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          industry?: string | null
          location?: string | null
          name: string
          size?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string | null
          location?: string | null
          name?: string
          size?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          location: string | null
          posted_by: string | null
          role_id: string | null
          salary_max: number | null
          salary_min: number | null
          title: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          posted_by?: string | null
          role_id?: string | null
          salary_max?: number | null
          salary_min?: number | null
          title: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          posted_by?: string | null
          role_id?: string | null
          salary_max?: number | null
          salary_min?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      narration_cache: {
        Row: {
          created_at: string
          profile_id: string
          root_role_id: string
          shape_hash: string
          text: string
          used_ai: boolean
        }
        Insert: {
          created_at?: string
          profile_id: string
          root_role_id: string
          shape_hash: string
          text: string
          used_ai?: boolean
        }
        Update: {
          created_at?: string
          profile_id?: string
          root_role_id?: string
          shape_hash?: string
          text?: string
          used_ai?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "narration_cache_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_skills: {
        Row: {
          level: number
          profile_id: string
          skill_id: string
        }
        Insert: {
          level?: number
          profile_id: string
          skill_id: string
        }
        Update: {
          level?: number
          profile_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_role: Database["public"]["Enums"]["account_role"]
          achievements: Json
          company_id: string | null
          created_at: string
          current_role_id: string | null
          experience: Json
          findability: Database["public"]["Enums"]["findability"]
          full_name: string | null
          headline: string | null
          id: string
          location: string | null
          resume_text: string | null
          summary: string | null
          university: string | null
          updated_at: string
        }
        Insert: {
          account_role?: Database["public"]["Enums"]["account_role"]
          achievements?: Json
          company_id?: string | null
          created_at?: string
          current_role_id?: string | null
          experience?: Json
          findability?: Database["public"]["Enums"]["findability"]
          full_name?: string | null
          headline?: string | null
          id: string
          location?: string | null
          resume_text?: string | null
          summary?: string | null
          university?: string | null
          updated_at?: string
        }
        Update: {
          account_role?: Database["public"]["Enums"]["account_role"]
          achievements?: Json
          company_id?: string | null
          created_at?: string
          current_role_id?: string | null
          experience?: Json
          findability?: Database["public"]["Enums"]["findability"]
          full_name?: string | null
          headline?: string | null
          id?: string
          location?: string | null
          resume_text?: string | null
          summary?: string | null
          university?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_current_role_id_fkey"
            columns: ["current_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmaps: {
        Row: {
          company: string | null
          created_at: string
          done_steps: Json
          from_role: string
          id: string
          phases: Json
          profile_id: string
          summary: string | null
          to_role: string
          to_role_id: string | null
          total_months: number | null
          used_ai: boolean
        }
        Insert: {
          company?: string | null
          created_at?: string
          done_steps?: Json
          from_role: string
          id?: string
          phases?: Json
          profile_id: string
          summary?: string | null
          to_role: string
          to_role_id?: string | null
          total_months?: number | null
          used_ai?: boolean
        }
        Update: {
          company?: string | null
          created_at?: string
          done_steps?: Json
          from_role?: string
          id?: string
          phases?: Json
          profile_id?: string
          summary?: string | null
          to_role?: string
          to_role_id?: string | null
          total_months?: number | null
          used_ai?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "roadmaps_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_skills: {
        Row: {
          role_id: string
          skill_id: string
          weight: number
        }
        Insert: {
          role_id: string
          skill_id: string
          weight?: number
        }
        Update: {
          role_id?: string
          skill_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "role_skills_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          family: string
          id: string
          salary_max: number | null
          salary_min: number | null
          seniority: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          family: string
          id?: string
          salary_max?: number | null
          salary_min?: number | null
          seniority?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          family?: string
          id?: string
          salary_max?: number | null
          salary_min?: number | null
          seniority?: number
          title?: string
        }
        Relationships: []
      }
      signals: {
        Row: {
          accepted: boolean | null
          candidate_id: string
          created_at: string
          employer_id: string
          id: string
          job_id: string | null
          why_you: string
        }
        Insert: {
          accepted?: boolean | null
          candidate_id: string
          created_at?: string
          employer_id: string
          id?: string
          job_id?: string | null
          why_you: string
        }
        Update: {
          accepted?: boolean | null
          candidate_id?: string
          created_at?: string
          employer_id?: string
          id?: string
          job_id?: string | null
          why_you?: string
        }
        Relationships: [
          {
            foreignKeyName: "signals_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signals_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      transitions: {
        Row: {
          from_role_id: string
          id: string
          median_months: number | null
          note: string | null
          share: number
          to_role_id: string
        }
        Insert: {
          from_role_id: string
          id?: string
          median_months?: number | null
          note?: string | null
          share: number
          to_role_id: string
        }
        Update: {
          from_role_id?: string
          id?: string
          median_months?: number | null
          note?: string | null
          share?: number
          to_role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transitions_from_role_id_fkey"
            columns: ["from_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transitions_to_role_id_fkey"
            columns: ["to_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_role: "candidate" | "employer" | "university"
      application_status:
        | "applied"
        | "reviewing"
        | "interview"
        | "offer"
        | "rejected"
        | "withdrawn"
      findability: "open" | "quiet" | "closed"
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
      account_role: ["candidate", "employer", "university"],
      application_status: [
        "applied",
        "reviewing",
        "interview",
        "offer",
        "rejected",
        "withdrawn",
      ],
      findability: ["open", "quiet", "closed"],
    },
  },
} as const
