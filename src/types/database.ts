export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ability_test_results: {
        Row: {
          estimated_level: string
          id: string
          scores: Json
          taken_at: string | null
          user_id: string
        }
        Insert: {
          estimated_level: string
          id?: string
          scores?: Json
          taken_at?: string | null
          user_id: string
        }
        Update: {
          estimated_level?: string
          id?: string
          scores?: Json
          taken_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ability_test_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          description: string
          icon: string
          id: string
          slug: string
          title: string
          xp_reward: number
        }
        Insert: {
          description: string
          icon: string
          id?: string
          slug: string
          title: string
          xp_reward?: number
        }
        Update: {
          description?: string
          icon?: string
          id?: string
          slug?: string
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      chapters: {
        Row: {
          description: string
          id: string
          order_index: number
          title: string
          unit_id: string
        }
        Insert: {
          description: string
          id?: string
          order_index: number
          title: string
          unit_id: string
        }
        Update: {
          description?: string
          id?: string
          order_index?: number
          title?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_activity: {
        Row: {
          activity_date: string
          exercises_completed: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          activity_date: string
          exercises_completed?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          activity_date?: string
          exercises_completed?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          correct_answer: Json
          data: Json
          difficulty: number
          id: string
          lesson_id: string | null
          level_code: string
          order_index: number
          prompt: string
          tags: string[]
          type: string
        }
        Insert: {
          correct_answer: Json
          data: Json
          difficulty?: number
          id?: string
          lesson_id?: string | null
          level_code: string
          order_index?: number
          prompt: string
          tags?: string[]
          type: string
        }
        Update: {
          correct_answer?: Json
          data?: Json
          difficulty?: number
          id?: string
          lesson_id?: string | null
          level_code?: string
          order_index?: number
          prompt?: string
          tags?: string[]
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_level_code_fkey"
            columns: ["level_code"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["code"]
          },
        ]
      }
      grammar_topics: {
        Row: {
          content_md: string
          examples: Json
          id: string
          level_code: string
          order_index: number
          slug: string
          summary: string
          title: string
        }
        Insert: {
          content_md: string
          examples?: Json
          id?: string
          level_code: string
          order_index: number
          slug: string
          summary: string
          title: string
        }
        Update: {
          content_md?: string
          examples?: Json
          id?: string
          level_code?: string
          order_index?: number
          slug?: string
          summary?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "grammar_topics_level_code_fkey"
            columns: ["level_code"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["code"]
          },
        ]
      }
      lessons: {
        Row: {
          chapter_id: string
          content: Json
          id: string
          order_index: number
          title: string
          type: string
          xp_reward: number
        }
        Insert: {
          chapter_id: string
          content?: Json
          id?: string
          order_index: number
          title: string
          type: string
          xp_reward?: number
        }
        Update: {
          chapter_id?: string
          content?: Json
          id?: string
          order_index?: number
          title?: string
          type?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "lessons_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          code: string
          description: string
          order_index: number
          title: string
        }
        Insert: {
          code: string
          description: string
          order_index: number
          title: string
        }
        Update: {
          code?: string
          description?: string
          order_index?: number
          title?: string
        }
        Relationships: []
      }
      listening_clips: {
        Row: {
          audio_url: string
          duration_seconds: number
          id: string
          level_code: string
          questions: Json
          title: string
          transcript: string
          translation: string
        }
        Insert: {
          audio_url: string
          duration_seconds: number
          id?: string
          level_code: string
          questions?: Json
          title: string
          transcript: string
          translation: string
        }
        Update: {
          audio_url?: string
          duration_seconds?: number
          id?: string
          level_code?: string
          questions?: Json
          title?: string
          transcript?: string
          translation?: string
        }
        Relationships: [
          {
            foreignKeyName: "listening_clips_level_code_fkey"
            columns: ["level_code"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["code"]
          },
        ]
      }
      listening_videos: {
        Row: {
          channel_name: string
          created_at: string
          description: string | null
          duration_seconds: number
          exercises: Json
          id: string
          level_code: string
          order_index: number
          theme: string
          title: string
          transcript: string | null
          youtube_id: string
        }
        Insert: {
          channel_name: string
          created_at?: string
          description?: string | null
          duration_seconds?: number
          exercises?: Json
          id?: string
          level_code: string
          order_index?: number
          theme: string
          title: string
          transcript?: string | null
          youtube_id: string
        }
        Update: {
          channel_name?: string
          created_at?: string
          description?: string | null
          duration_seconds?: number
          exercises?: Json
          id?: string
          level_code?: string
          order_index?: number
          theme?: string
          title?: string
          transcript?: string | null
          youtube_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_level: string | null
          dialect_preference: string
          display_name: string | null
          hearts: number
          hearts_refilled_at: string | null
          id: string
          last_active_at: string | null
          spelling_preference: string
          streak_days: number
          ui_language: string | null
          updated_at: string | null
          username: string | null
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_level?: string | null
          dialect_preference?: string
          display_name?: string | null
          hearts?: number
          hearts_refilled_at?: string | null
          id: string
          last_active_at?: string | null
          spelling_preference?: string
          streak_days?: number
          ui_language?: string | null
          updated_at?: string | null
          username?: string | null
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_level?: string | null
          dialect_preference?: string
          display_name?: string | null
          hearts?: number
          hearts_refilled_at?: string | null
          id?: string
          last_active_at?: string | null
          spelling_preference?: string
          streak_days?: number
          ui_language?: string | null
          updated_at?: string | null
          username?: string | null
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_level_fkey"
            columns: ["current_level"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["code"]
          },
        ]
      }
      reading_resources: {
        Row: {
          created_at: string
          estimated_minutes: number
          external_url: string
          id: string
          level_code: string
          order_index: number
          theme: string
          title_en: string
          title_fr: string
        }
        Insert: {
          created_at?: string
          estimated_minutes?: number
          external_url: string
          id?: string
          level_code: string
          order_index?: number
          theme: string
          title_en: string
          title_fr: string
        }
        Update: {
          created_at?: string
          estimated_minutes?: number
          external_url?: string
          id?: string
          level_code?: string
          order_index?: number
          theme?: string
          title_en?: string
          title_fr?: string
        }
        Relationships: []
      }
      reading_texts: {
        Row: {
          audio_url: string | null
          body_md: string
          estimated_minutes: number
          id: string
          level_code: string
          source: string | null
          title: string
          word_count: number
        }
        Insert: {
          audio_url?: string | null
          body_md: string
          estimated_minutes: number
          id?: string
          level_code: string
          source?: string | null
          title: string
          word_count: number
        }
        Update: {
          audio_url?: string | null
          body_md?: string
          estimated_minutes?: number
          id?: string
          level_code?: string
          source?: string | null
          title?: string
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "reading_texts_level_code_fkey"
            columns: ["level_code"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["code"]
          },
        ]
      }
      speaking_prompts: {
        Row: {
          audio_url: string | null
          focus: string | null
          id: string
          level_code: string
          text_fr: string
        }
        Insert: {
          audio_url?: string | null
          focus?: string | null
          id?: string
          level_code: string
          text_fr: string
        }
        Update: {
          audio_url?: string | null
          focus?: string | null
          id?: string
          level_code?: string
          text_fr?: string
        }
        Relationships: [
          {
            foreignKeyName: "speaking_prompts_level_code_fkey"
            columns: ["level_code"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["code"]
          },
        ]
      }
      srs_cards: {
        Row: {
          due_date: string
          ease_factor: number
          id: string
          interval_days: number
          item_id: string
          item_type: string
          last_reviewed: string | null
          repetitions: number
          user_id: string
        }
        Insert: {
          due_date?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          item_id: string
          item_type: string
          last_reviewed?: string | null
          repetitions?: number
          user_id: string
        }
        Update: {
          due_date?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          item_id?: string
          item_type?: string
          last_reviewed?: string | null
          repetitions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "srs_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          description: string
          id: string
          level_code: string
          order_index: number
          title: string
        }
        Insert: {
          description: string
          id?: string
          level_code: string
          order_index: number
          title: string
        }
        Update: {
          description?: string
          id?: string
          level_code?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_level_code_fkey"
            columns: ["level_code"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["code"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_exercise_attempts: {
        Row: {
          attempted_at: string | null
          exercise_id: string
          id: string
          is_correct: boolean
          time_taken_ms: number | null
          user_answer: Json
          user_id: string
        }
        Insert: {
          attempted_at?: string | null
          exercise_id: string
          id?: string
          is_correct: boolean
          time_taken_ms?: number | null
          user_answer: Json
          user_id: string
        }
        Update: {
          attempted_at?: string | null
          exercise_id?: string
          id?: string
          is_correct?: boolean
          time_taken_ms?: number | null
          user_answer?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_exercise_attempts_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_attempts_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_listening_progress: {
        Row: {
          completed_at: string
          id: string
          score: number
          user_id: string
          video_id: string
          xp_awarded: number
        }
        Insert: {
          completed_at?: string
          id?: string
          score?: number
          user_id: string
          video_id: string
          xp_awarded?: number
        }
        Update: {
          completed_at?: string
          id?: string
          score?: number
          user_id?: string
          video_id?: string
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_listening_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "listening_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          attempts: number
          completed_at: string | null
          id: string
          lesson_id: string
          score: number | null
          status: string
          user_id: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          id?: string
          lesson_id: string
          score?: number | null
          status?: string
          user_id: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          id?: string
          lesson_id?: string
          score?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reading_progress: {
        Row: {
          completed_at: string
          id: string
          resource_id: string
          user_id: string
          xp_awarded: number
        }
        Insert: {
          completed_at?: string
          id?: string
          resource_id: string
          user_id: string
          xp_awarded?: number
        }
        Update: {
          completed_at?: string
          id?: string
          resource_id?: string
          user_id?: string
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_reading_progress_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "reading_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skill_scores: {
        Row: {
          score: number
          skill: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          score?: number
          skill: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          score?: number
          skill?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skill_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verbs: {
        Row: {
          auxiliary: string | null
          conjugations: Json
          created_at: string
          edge_cases: string | null
          en: string | null
          id: string
          infinitif: string
          is_irregular: boolean
          level_code: string | null
          participe_passe: string | null
          participe_present: string | null
          source: string
          stem_changes: string | null
          updated_at: string
          verb_group: number | null
        }
        Insert: {
          auxiliary?: string | null
          conjugations?: Json
          created_at?: string
          edge_cases?: string | null
          en?: string | null
          id: string
          infinitif: string
          is_irregular?: boolean
          level_code?: string | null
          participe_passe?: string | null
          participe_present?: string | null
          source?: string
          stem_changes?: string | null
          updated_at?: string
          verb_group?: number | null
        }
        Update: {
          auxiliary?: string | null
          conjugations?: Json
          created_at?: string
          edge_cases?: string | null
          en?: string | null
          id?: string
          infinitif?: string
          is_irregular?: boolean
          level_code?: string | null
          participe_passe?: string | null
          participe_present?: string | null
          source?: string
          stem_changes?: string | null
          updated_at?: string
          verb_group?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "verbs_level_code_fkey"
            columns: ["level_code"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["code"]
          },
        ]
      }
      vocabulary: {
        Row: {
          audio_url: string | null
          en_alt: string | null
          english: string
          example_en: string | null
          example_fr: string | null
          feminine: string | null
          feminine_plural: string | null
          french: string
          gender: string | null
          id: string
          image_url: string | null
          ipa: string | null
          level_code: string
          masculine_plural: string | null
          notes: string | null
          part_of_speech: string
          plural: string | null
          theme: string
        }
        Insert: {
          audio_url?: string | null
          en_alt?: string | null
          english: string
          example_en?: string | null
          example_fr?: string | null
          feminine?: string | null
          feminine_plural?: string | null
          french: string
          gender?: string | null
          id?: string
          image_url?: string | null
          ipa?: string | null
          level_code: string
          masculine_plural?: string | null
          notes?: string | null
          part_of_speech?: string
          plural?: string | null
          theme: string
        }
        Update: {
          audio_url?: string | null
          en_alt?: string | null
          english?: string
          example_en?: string | null
          example_fr?: string | null
          feminine?: string | null
          feminine_plural?: string | null
          french?: string
          gender?: string | null
          id?: string
          image_url?: string | null
          ipa?: string | null
          level_code?: string
          masculine_plural?: string | null
          notes?: string | null
          part_of_speech?: string
          plural?: string | null
          theme?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_level_code_fkey"
            columns: ["level_code"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["code"]
          },
        ]
      }
      writing_prompts: {
        Row: {
          created_at: string
          id: string
          instructions: string
          level_code: string
          max_words: number
          min_words: number
          model_answer: string
          order_index: number
          prompt: string
          rubric: Json
          sentence_starters: string[]
          sub_topic: string | null
          theme: string
          title: string
          topic: string
          word_max: number
          word_min: number
        }
        Insert: {
          created_at?: string
          id?: string
          instructions?: string
          level_code: string
          max_words: number
          min_words: number
          model_answer?: string
          order_index?: number
          prompt: string
          rubric?: Json
          sentence_starters?: string[]
          sub_topic?: string | null
          theme?: string
          title: string
          topic?: string
          word_max?: number
          word_min?: number
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string
          level_code?: string
          max_words?: number
          min_words?: number
          model_answer?: string
          order_index?: number
          prompt?: string
          rubric?: Json
          sentence_starters?: string[]
          sub_topic?: string | null
          theme?: string
          title?: string
          topic?: string
          word_max?: number
          word_min?: number
        }
        Relationships: [
          {
            foreignKeyName: "writing_prompts_level_code_fkey"
            columns: ["level_code"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["code"]
          },
        ]
      }
      writing_submissions: {
        Row: {
          ai_feedback: Json | null
          content: string
          created_at: string
          id: string
          prompt_id: string
          score: number | null
          submitted_at: string | null
          user_id: string
          word_count: number
          xp_awarded: number
        }
        Insert: {
          ai_feedback?: Json | null
          content: string
          created_at?: string
          id?: string
          prompt_id: string
          score?: number | null
          submitted_at?: string | null
          user_id: string
          word_count: number
          xp_awarded?: number
        }
        Update: {
          ai_feedback?: Json | null
          content?: string
          created_at?: string
          id?: string
          prompt_id?: string
          score?: number | null
          submitted_at?: string | null
          user_id?: string
          word_count?: number
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "writing_submissions_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "writing_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "writing_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      exercises_public: {
        Row: {
          data: Json | null
          difficulty: number | null
          id: string | null
          lesson_id: string | null
          level_code: string | null
          order_index: number | null
          prompt: string | null
          tags: string[] | null
          type: string | null
        }
        Insert: {
          data?: Json | null
          difficulty?: number | null
          id?: string | null
          lesson_id?: string | null
          level_code?: string | null
          order_index?: number | null
          prompt?: string | null
          tags?: string[] | null
          type?: string | null
        }
        Update: {
          data?: Json | null
          difficulty?: number | null
          id?: string | null
          lesson_id?: string | null
          level_code?: string | null
          order_index?: number | null
          prompt?: string | null
          tags?: string[] | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_level_code_fkey"
            columns: ["level_code"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["code"]
          },
        ]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

