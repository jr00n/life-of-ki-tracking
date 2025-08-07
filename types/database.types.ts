export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          mood: number | null
          energy_level: number | null
          daily_intention: string | null
          sleep_hours: number | null
          sleep_quality: number | null
          wake_up_time: string | null
          bedtime: string | null
          stress_level: number | null
          exercise_minutes: number | null
          exercise_type: string | null
          meditation_minutes: number | null
          meditation_type: string | null
          outdoor_time: number | null
          water_glasses: number | null
          gratitude: string | null
          day_highlight: string | null
          challenges_faced: string | null
          tomorrow_focus: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          mood?: number | null
          energy_level?: number | null
          daily_intention?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          wake_up_time?: string | null
          bedtime?: string | null
          stress_level?: number | null
          exercise_minutes?: number | null
          exercise_type?: string | null
          meditation_minutes?: number | null
          meditation_type?: string | null
          outdoor_time?: number | null
          water_glasses?: number | null
          gratitude?: string | null
          day_highlight?: string | null
          challenges_faced?: string | null
          tomorrow_focus?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          mood?: number | null
          energy_level?: number | null
          daily_intention?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          wake_up_time?: string | null
          bedtime?: string | null
          stress_level?: number | null
          exercise_minutes?: number | null
          exercise_type?: string | null
          meditation_minutes?: number | null
          meditation_type?: string | null
          outdoor_time?: number | null
          water_glasses?: number | null
          gratitude?: string | null
          day_highlight?: string | null
          challenges_faced?: string | null
          tomorrow_focus?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      weekly_summaries: {
        Row: {
          id: string
          user_id: string
          week_start: string
          week_end: string
          avg_mood: number | null
          avg_energy: number | null
          avg_sleep_hours: number | null
          avg_sleep_quality: number | null
          total_exercise_minutes: number | null
          total_meditation_minutes: number | null
          avg_stress_level: number | null
          insights: string | null
          weekly_assignment: string | null
          assignment_completed: boolean
          personal_insight: string | null
          movement_goal_achieved: boolean | null
          movement_goal_next_week: string | null
          nutrition_goal_achieved: boolean | null
          nutrition_goal_next_week: string | null
          favorite_relaxation: string | null
          relaxation_goal_next_week: string | null
          overall_energy_reflection: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start: string
          week_end: string
          avg_mood?: number | null
          avg_energy?: number | null
          avg_sleep_hours?: number | null
          avg_sleep_quality?: number | null
          total_exercise_minutes?: number | null
          total_meditation_minutes?: number | null
          avg_stress_level?: number | null
          insights?: string | null
          weekly_assignment?: string | null
          assignment_completed?: boolean
          personal_insight?: string | null
          movement_goal_achieved?: boolean | null
          movement_goal_next_week?: string | null
          nutrition_goal_achieved?: boolean | null
          nutrition_goal_next_week?: string | null
          favorite_relaxation?: string | null
          relaxation_goal_next_week?: string | null
          overall_energy_reflection?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_start?: string
          week_end?: string
          avg_mood?: number | null
          avg_energy?: number | null
          avg_sleep_hours?: number | null
          avg_sleep_quality?: number | null
          total_exercise_minutes?: number | null
          total_meditation_minutes?: number | null
          avg_stress_level?: number | null
          insights?: string | null
          weekly_assignment?: string | null
          assignment_completed?: boolean
          personal_insight?: string | null
          movement_goal_achieved?: boolean | null
          movement_goal_next_week?: string | null
          nutrition_goal_achieved?: boolean | null
          nutrition_goal_next_week?: string | null
          favorite_relaxation?: string | null
          relaxation_goal_next_week?: string | null
          overall_energy_reflection?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          week_start_day: number
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start_day?: number
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_start_day?: number
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      favorite_foods: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          default_time: string | null
          category: 'ontbijt' | 'lunch' | 'diner' | 'snack' | 'drank' | 'anders' | null
          usage_count: number
          last_used: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description: string
          default_time?: string | null
          category?: 'ontbijt' | 'lunch' | 'diner' | 'snack' | 'drank' | 'anders' | null
          usage_count?: number
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          default_time?: string | null
          category?: 'ontbijt' | 'lunch' | 'diner' | 'snack' | 'drank' | 'anders' | null
          usage_count?: number
          last_used?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_foods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      nutrition_entries: {
        Row: {
          id: string
          daily_entry_id: string
          time_consumed: string
          food_description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          daily_entry_id: string
          time_consumed: string
          food_description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          daily_entry_id?: string
          time_consumed?: string
          food_description?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_entries_daily_entry_id_fkey"
            columns: ["daily_entry_id"]
            isOneToOne: false
            referencedRelation: "daily_entries"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      user_stats: {
        Row: {
          user_id: string | null
          name: string | null
          total_entries: number | null
          last_entry_date: string | null
          total_weekly_summaries: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

// Helper types for better DX
export type User = Database['public']['Tables']['users']['Row']
export type DailyEntry = Database['public']['Tables']['daily_entries']['Row']
export type WeeklySummary = Database['public']['Tables']['weekly_summaries']['Row']
export type NutritionEntry = Database['public']['Tables']['nutrition_entries']['Row']
export type FavoriteFood = Database['public']['Tables']['favorite_foods']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']

export type UserInsert = Database['public']['Tables']['users']['Insert']
export type DailyEntryInsert = Database['public']['Tables']['daily_entries']['Insert']
export type WeeklySummaryInsert = Database['public']['Tables']['weekly_summaries']['Insert']
export type NutritionEntryInsert = Database['public']['Tables']['nutrition_entries']['Insert']
export type FavoriteFoodInsert = Database['public']['Tables']['favorite_foods']['Insert']
export type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert']

export type UserUpdate = Database['public']['Tables']['users']['Update']
export type DailyEntryUpdate = Database['public']['Tables']['daily_entries']['Update']
export type WeeklySummaryUpdate = Database['public']['Tables']['weekly_summaries']['Update']
export type NutritionEntryUpdate = Database['public']['Tables']['nutrition_entries']['Update']
export type FavoriteFoodUpdate = Database['public']['Tables']['favorite_foods']['Update']
export type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update']

export type UserStats = Database['public']['Views']['user_stats']['Row']