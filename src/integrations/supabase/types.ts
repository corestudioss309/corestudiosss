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
      addon_settings: {
        Row: {
          business_email_enabled: boolean
          business_email_price: number
          custom_domain_enabled: boolean
          custom_domain_price: number
          id: string
          updated_at: string
        }
        Insert: {
          business_email_enabled?: boolean
          business_email_price?: number
          custom_domain_enabled?: boolean
          custom_domain_price?: number
          id?: string
          updated_at?: string
        }
        Update: {
          business_email_enabled?: boolean
          business_email_price?: number
          custom_domain_enabled?: boolean
          custom_domain_price?: number
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          applies_to: string
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          applies_to?: string
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          applies_to?: string
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      interested_leads: {
        Row: {
          business_type: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          status: string
          whatsapp: string
        }
        Insert: {
          business_type: string
          created_at?: string
          email: string
          id?: string
          name: string
          phone: string
          status?: string
          whatsapp: string
        }
        Update: {
          business_type?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          status?: string
          whatsapp?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          phone: string
          status: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          phone: string
          status?: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string
          status?: string
          whatsapp?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          addon_total: number
          business_email_addon: boolean
          business_name: string
          coupon_code: string | null
          coupon_discount: number | null
          created_at: string
          custom_domain_addon: boolean
          email: string
          full_name: string
          id: string
          monthly_fee: number
          order_id: string
          payment_method: string | null
          phone: string
          project_status: Database["public"]["Enums"]["project_status"]
          receipt_url: string | null
          renewal_date: string | null
          setup_fee: number
          start_date: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string | null
          website_requirements: string | null
          website_status: Database["public"]["Enums"]["website_status"]
          whatsapp: string
        }
        Insert: {
          addon_total?: number
          business_email_addon?: boolean
          business_name: string
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string
          custom_domain_addon?: boolean
          email: string
          full_name: string
          id?: string
          monthly_fee?: number
          order_id: string
          payment_method?: string | null
          phone: string
          project_status?: Database["public"]["Enums"]["project_status"]
          receipt_url?: string | null
          renewal_date?: string | null
          setup_fee?: number
          start_date?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string | null
          website_requirements?: string | null
          website_status?: Database["public"]["Enums"]["website_status"]
          whatsapp: string
        }
        Update: {
          addon_total?: number
          business_email_addon?: boolean
          business_name?: string
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string
          custom_domain_addon?: boolean
          email?: string
          full_name?: string
          id?: string
          monthly_fee?: number
          order_id?: string
          payment_method?: string | null
          phone?: string
          project_status?: Database["public"]["Enums"]["project_status"]
          receipt_url?: string | null
          renewal_date?: string | null
          setup_fee?: number
          start_date?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string | null
          website_requirements?: string | null
          website_status?: Database["public"]["Enums"]["website_status"]
          whatsapp?: string
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          id: string
          instapay_account_number: string | null
          instapay_link: string | null
          instapay_qr_url: string | null
          instapay_username: string | null
          updated_at: string
          vodafone_link: string | null
          vodafone_number: string | null
          vodafone_qr_url: string | null
        }
        Insert: {
          id?: string
          instapay_account_number?: string | null
          instapay_link?: string | null
          instapay_qr_url?: string | null
          instapay_username?: string | null
          updated_at?: string
          vodafone_link?: string | null
          vodafone_number?: string | null
          vodafone_qr_url?: string | null
        }
        Update: {
          id?: string
          instapay_account_number?: string | null
          instapay_link?: string | null
          instapay_qr_url?: string | null
          instapay_username?: string | null
          updated_at?: string
          vodafone_link?: string | null
          vodafone_number?: string | null
          vodafone_qr_url?: string | null
        }
        Relationships: []
      }
      popup_settings: {
        Row: {
          coupon_code: string | null
          description_ar: string
          description_en: string
          id: string
          include_coupon: boolean
          is_active: boolean
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          coupon_code?: string | null
          description_ar?: string
          description_en?: string
          id?: string
          include_coupon?: boolean
          is_active?: boolean
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Update: {
          coupon_code?: string | null
          description_ar?: string
          description_en?: string
          id?: string
          include_coupon?: boolean
          is_active?: boolean
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing: {
        Row: {
          discount_enabled: boolean
          discount_percent: number
          id: string
          monthly_fee: number
          setup_fee: number
          updated_at: string
        }
        Insert: {
          discount_enabled?: boolean
          discount_percent?: number
          id?: string
          monthly_fee?: number
          setup_fee?: number
          updated_at?: string
        }
        Update: {
          discount_enabled?: boolean
          discount_percent?: number
          id?: string
          monthly_fee?: number
          setup_fee?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      renewals: {
        Row: {
          business_name: string
          coupon_code: string | null
          coupon_discount: number
          created_at: string
          email: string
          full_name: string
          id: string
          original_order_id: string
          payment_method: string | null
          phone: string
          receipt_url: string | null
          renewal_fee: number
          renewal_id: string
          status: Database["public"]["Enums"]["renewal_status"]
          whatsapp: string
        }
        Insert: {
          business_name: string
          coupon_code?: string | null
          coupon_discount?: number
          created_at?: string
          email: string
          full_name: string
          id?: string
          original_order_id: string
          payment_method?: string | null
          phone: string
          receipt_url?: string | null
          renewal_fee: number
          renewal_id: string
          status?: Database["public"]["Enums"]["renewal_status"]
          whatsapp: string
        }
        Update: {
          business_name?: string
          coupon_code?: string | null
          coupon_discount?: number
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          original_order_id?: string
          payment_method?: string | null
          phone?: string
          receipt_url?: string | null
          renewal_fee?: number
          renewal_id?: string
          status?: Database["public"]["Enums"]["renewal_status"]
          whatsapp?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          rating: number
          review_ar: string
          review_en: string
          role_ar: string
          role_en: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          rating?: number
          review_ar?: string
          review_en?: string
          role_ar?: string
          role_en?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          rating?: number
          review_ar?: string
          review_en?: string
          role_ar?: string
          role_en?: string
        }
        Relationships: []
      }
      snaps: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          title: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          title?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_coupon_usage: {
        Args: { coupon_code: string }
        Returns: undefined
      }
      order_exists: { Args: { _order_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user" | "viewer"
      project_status: "received" | "in_progress" | "delivered"
      renewal_status: "pending" | "confirmed" | "rejected"
      subscription_status:
        | "pending"
        | "active"
        | "suspended"
        | "expired"
        | "renewed"
        | "didnt_renew"
        | "fake_order"
      website_status: "live" | "disabled" | "maintenance" | "paused"
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
    Enums: {
      app_role: ["admin", "user", "viewer"],
      project_status: ["received", "in_progress", "delivered"],
      renewal_status: ["pending", "confirmed", "rejected"],
      subscription_status: [
        "pending",
        "active",
        "suspended",
        "expired",
        "renewed",
        "didnt_renew",
        "fake_order",
      ],
      website_status: ["live", "disabled", "maintenance", "paused"],
    },
  },
} as const
