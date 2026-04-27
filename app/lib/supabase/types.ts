export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      routine_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          log: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          log: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          log?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      custom_foods: {
        Row: {
          id: string;
          user_id: string;
          food_key: string;
          label: string;
          protein_grams: number;
          unit_label: string;
          category: string;
          is_archived: boolean;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          food_key: string;
          label: string;
          protein_grams?: number;
          unit_label: string;
          category: string;
          is_archived?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          food_key?: string;
          label?: string;
          protein_grams?: number;
          unit_label?: string;
          category?: string;
          is_archived?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          user_id: string;
          height_cm: number;
          weight_kg: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          height_cm?: number;
          weight_kg?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          height_cm?: number;
          weight_kg?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          favorite_food_ids: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          favorite_food_ids?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          favorite_food_ids?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
