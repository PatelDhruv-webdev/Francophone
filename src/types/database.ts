// Hand-written Database type for Supabase type-safety.
// Covers all tables from the migration files.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          current_level: string | null
          xp: number
          streak_days: number
          last_active_date: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          current_level?: string | null
          xp?: number
          streak_days?: number
          last_active_date?: string | null
          created_at?: string
        }
        Update: {
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          current_level?: string | null
          xp?: number
          streak_days?: number
          last_active_date?: string | null
        }
      }
      levels: {
        Row: {
          id: string
          code: string
          name: string
          description: string
          order_index: number
        }
        Insert: {
          id?: string
          code: string
          name: string
          description: string
          order_index: number
        }
        Update: {
          code?: string
          name?: string
          description?: string
          order_index?: number
        }
      }
      units: {
        Row: {
          id: string
          title: string
          description: string
          level_id: string
          order_index: number
        }
        Insert: {
          id?: string
          title: string
          description: string
          level_id: string
          order_index: number
        }
        Update: {
          title?: string
          description?: string
          level_id?: string
          order_index?: number
        }
      }
      chapters: {
        Row: {
          id: string
          title: string
          unit_id: string
          order_index: number
        }
        Insert: {
          id?: string
          title: string
          unit_id: string
          order_index: number
        }
        Update: {
          title?: string
          unit_id?: string
          order_index?: number
        }
      }
      lessons: {
        Row: {
          id: string
          title: string
          description: string | null
          chapter_id: string
          order_index: number
          is_grammar: boolean
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          chapter_id: string
          order_index: number
          is_grammar?: boolean
        }
        Update: {
          title?: string
          description?: string | null
          chapter_id?: string
          order_index?: number
          is_grammar?: boolean
        }
      }
      exercises: {
        Row: {
          id: string
          lesson_id: string | null
          type: string
          prompt: string
          data: unknown
          correct_answer: unknown
          difficulty: number
          level_code: string
          tags: string[]
          order_index: number
        }
        Insert: {
          id?: string
          lesson_id?: string | null
          type: string
          prompt: string
          data: unknown
          correct_answer: unknown
          difficulty?: number
          level_code: string
          tags?: string[]
          order_index?: number
        }
        Update: {
          lesson_id?: string | null
          type?: string
          prompt?: string
          data?: unknown
          correct_answer?: unknown
          difficulty?: number
          level_code?: string
          tags?: string[]
          order_index?: number
        }
      }
      vocabulary: {
        Row: {
          id: string
          french: string
          english: string
          pronunciation: string | null
          example_fr: string | null
          example_en: string | null
          image_url: string | null
          audio_url: string | null
          level_code: string
          theme: string
          tags: string[]
        }
        Insert: {
          id?: string
          french: string
          english: string
          pronunciation?: string | null
          example_fr?: string | null
          example_en?: string | null
          image_url?: string | null
          audio_url?: string | null
          level_code: string
          theme: string
          tags?: string[]
        }
        Update: {
          french?: string
          english?: string
          pronunciation?: string | null
          example_fr?: string | null
          example_en?: string | null
          image_url?: string | null
          audio_url?: string | null
          level_code?: string
          theme?: string
          tags?: string[]
        }
      }
      grammar_topics: {
        Row: {
          id: string
          title: string
          slug: string
          order_index: number
          level_code: string
          explanation_md: string
          key_points: string[]
          examples: unknown
          conjugation_table: unknown | null
          common_mistakes: string[]
        }
        Insert: {
          id?: string
          title: string
          slug: string
          order_index: number
          level_code: string
          explanation_md: string
          key_points?: string[]
          examples?: unknown
          conjugation_table?: unknown | null
          common_mistakes?: string[]
        }
        Update: {
          title?: string
          slug?: string
          order_index?: number
          level_code?: string
          explanation_md?: string
          key_points?: string[]
          examples?: unknown
          conjugation_table?: unknown | null
          common_mistakes?: string[]
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed_at: string | null
          xp_earned: number
          score: number | null
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed_at?: string | null
          xp_earned?: number
          score?: number | null
        }
        Update: {
          completed_at?: string | null
          xp_earned?: number
          score?: number | null
        }
      }
      user_exercise_attempts: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          answer: unknown
          correct: boolean
          xp_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          answer: unknown
          correct: boolean
          xp_earned?: number
          created_at?: string
        }
        Update: {
          answer?: unknown
          correct?: boolean
          xp_earned?: number
        }
      }
      srs_cards: {
        Row: {
          id: string
          user_id: string
          item_type: string
          item_id: string
          ease_factor: number
          interval_days: number
          repetitions: number
          due_date: string
          created_at: string
          last_reviewed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          item_type: string
          item_id: string
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          due_date?: string
          created_at?: string
          last_reviewed_at?: string | null
        }
        Update: {
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          due_date?: string
          last_reviewed_at?: string | null
        }
      }
      achievements: {
        Row: {
          id: string
          slug: string
          title: string
          description: string
          icon: string
          xp_reward: number
          condition_type: string
          condition_value: number
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description: string
          icon: string
          xp_reward?: number
          condition_type: string
          condition_value: number
        }
        Update: {
          slug?: string
          title?: string
          description?: string
          icon?: string
          xp_reward?: number
          condition_type?: string
          condition_value?: number
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          unlocked_at?: string
        }
      }
      daily_activity: {
        Row: {
          id: string
          user_id: string
          activity_date: string
          xp_earned: number
          exercises_completed: number
          lessons_completed: number
        }
        Insert: {
          id?: string
          user_id: string
          activity_date: string
          xp_earned?: number
          exercises_completed?: number
          lessons_completed?: number
        }
        Update: {
          xp_earned?: number
          exercises_completed?: number
          lessons_completed?: number
        }
      }
      reading_resources: {
        Row: {
          id: string
          title_fr: string
          title_en: string
          external_url: string
          level_code: string
          theme: string
          estimated_minutes: number
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          title_fr: string
          title_en: string
          external_url: string
          level_code: string
          theme: string
          estimated_minutes?: number
          order_index?: number
          created_at?: string
        }
        Update: {
          title_fr?: string
          title_en?: string
          external_url?: string
          level_code?: string
          theme?: string
          estimated_minutes?: number
          order_index?: number
        }
      }
      user_reading_progress: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          completed_at: string
          xp_awarded: number
        }
        Insert: {
          id?: string
          user_id: string
          resource_id: string
          completed_at?: string
          xp_awarded?: number
        }
        Update: {
          completed_at?: string
          xp_awarded?: number
        }
      }
      writing_prompts: {
        Row: {
          id: string
          title: string
          instructions: string
          sentence_starters: string[]
          model_answer: string
          word_min: number
          word_max: number
          level_code: string
          theme: string
          topic: string
          sub_topic: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          instructions: string
          sentence_starters?: string[]
          model_answer: string
          word_min?: number
          word_max?: number
          level_code: string
          theme: string
          topic: string
          sub_topic?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          title?: string
          instructions?: string
          sentence_starters?: string[]
          model_answer?: string
          word_min?: number
          word_max?: number
          level_code?: string
          theme?: string
          topic?: string
          sub_topic?: string | null
          order_index?: number
        }
      }
      writing_submissions: {
        Row: {
          id: string
          user_id: string
          prompt_id: string
          content: string
          word_count: number
          xp_awarded: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt_id: string
          content: string
          word_count: number
          xp_awarded?: number
          created_at?: string
        }
        Update: {
          content?: string
          word_count?: number
          xp_awarded?: number
        }
      }
      listening_videos: {
        Row: {
          id: string
          youtube_id: string
          title: string
          channel_name: string
          duration_seconds: number
          level_code: string
          theme: string
          description: string | null
          transcript: string | null
          exercises: unknown
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          youtube_id: string
          title: string
          channel_name: string
          duration_seconds?: number
          level_code: string
          theme: string
          description?: string | null
          transcript?: string | null
          exercises?: unknown
          order_index?: number
          created_at?: string
        }
        Update: {
          youtube_id?: string
          title?: string
          channel_name?: string
          duration_seconds?: number
          level_code?: string
          theme?: string
          description?: string | null
          transcript?: string | null
          exercises?: unknown
          order_index?: number
        }
      }
      user_listening_progress: {
        Row: {
          id: string
          user_id: string
          video_id: string
          completed_at: string
          xp_awarded: number
          score: number
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          completed_at?: string
          xp_awarded?: number
          score?: number
        }
        Update: {
          completed_at?: string
          xp_awarded?: number
          score?: number
        }
      }
    }
    Views: {
      exercises_public: {
        Row: {
          id: string
          lesson_id: string | null
          type: string
          prompt: string
          data: unknown
          difficulty: number
          level_code: string
          tags: string[]
          order_index: number
        }
      }
    }
  }
}
