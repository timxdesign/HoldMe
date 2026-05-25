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
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          interests: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      spaces: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          visibility: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          visibility?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          visibility?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spaces_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      space_members: {
        Row: {
          id: string
          space_id: string
          user_id: string
          role: string
          permissions: Json
          joined_at: string
        }
        Insert: {
          id?: string
          space_id: string
          user_id: string
          role?: string
          permissions?: Json
          joined_at?: string
        }
        Update: {
          id?: string
          space_id?: string
          user_id?: string
          role?: string
          permissions?: Json
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_members_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "space_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      accountability_items: {
        Row: {
          id: string
          space_id: string
          user_id: string
          title: string
          description: string | null
          type: string
          frequency: string
          status: string
          due_date: string | null
          reminder_schedule: Json | null
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          space_id: string
          user_id: string
          title: string
          description?: string | null
          type?: string
          frequency?: string
          status?: string
          due_date?: string | null
          reminder_schedule?: Json | null
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          space_id?: string
          user_id?: string
          title?: string
          description?: string | null
          type?: string
          frequency?: string
          status?: string
          due_date?: string | null
          reminder_schedule?: Json | null
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accountability_items_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accountability_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      item_checkins: {
        Row: {
          id: string
          item_id: string
          user_id: string
          status: string
          note: string | null
          proof_url: string | null
          checked_in_at: string
        }
        Insert: {
          id?: string
          item_id: string
          user_id: string
          status: string
          note?: string | null
          proof_url?: string | null
          checked_in_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          user_id?: string
          status?: string
          note?: string | null
          proof_url?: string | null
          checked_in_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_checkins_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "accountability_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      strengths: {
        Row: {
          id: string
          item_id: string
          sender_id: string
          receiver_id: string
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          sender_id: string
          receiver_id: string
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          sender_id?: string
          receiver_id?: string
          message?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "strengths_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "accountability_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strengths_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strengths_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          id: string
          item_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "accountability_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      invites: {
        Row: {
          id: string
          space_id: string
          inviter_id: string
          email: string | null
          token: string
          status: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          space_id: string
          inviter_id: string
          email?: string | null
          token?: string
          status?: string
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          space_id?: string
          inviter_id?: string
          email?: string | null
          token?: string
          status?: string
          created_at?: string
          expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string | null
          space_id: string | null
          reason: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_user_id?: string | null
          space_id?: string | null
          reason: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_user_id?: string | null
          space_id?: string | null
          reason?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          }
        ]
      }
      circles: {
        Row: {
          id: string
          name: string
          emoji: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          emoji?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          emoji?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "circles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      circle_members: {
        Row: {
          id: string
          circle_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          circle_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          circle_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      circle_goals: {
        Row: {
          id: string
          circle_id: string
          title: string
          created_by: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          circle_id: string
          title: string
          created_by: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          circle_id?: string
          title?: string
          created_by?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_goals_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_goals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      circle_checkins: {
        Row: {
          id: string
          goal_id: string
          user_id: string
          note: string | null
          checked_in_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          user_id: string
          note?: string | null
          checked_in_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          user_id?: string
          note?: string | null
          checked_in_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_checkins_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "circle_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      circle_invites: {
        Row: {
          id: string
          circle_id: string
          inviter_id: string
          token: string
          status: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          circle_id: string
          inviter_id: string
          token?: string
          status?: string
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          circle_id?: string
          inviter_id?: string
          token?: string
          status?: string
          created_at?: string
          expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_invites_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_invites_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
