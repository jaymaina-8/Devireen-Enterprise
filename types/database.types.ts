export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      customers: {
        Row: {
          id: string;
          type: 'RETAIL' | 'BUSINESS';
          company_name: string | null;
          kra_pin: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          profile_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
      };
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          slug: string;
          sku: string;
          name: string;
          description: string | null;
          short_description: string | null;
          brand_id: string | null;
          is_all_categories: boolean;
          price: number;
          sale_price: number | null;
          wholesale_price: number | null;
          wholesale_unit: string | null;
          stock_status:
            'IN_STOCK' | 'OUT_OF_STOCK' | 'PRE_ORDER' | 'DISCONTINUED';
          attributes: Json;
          seo_title: string | null;
          seo_description: string | null;
          is_active: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
      };
      product_categories: {
        Row: {
          product_id: string;
          category_id: string;
          created_at: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          customer_id: string | null;
          session_id: string | null;
          status:
            | 'DRAFT'
            | 'PENDING'
            | 'REVIEWING'
            | 'APPROVED'
            | 'REJECTED'
            | 'FULFILLED';
          notes: string | null;
          total_amount: number;
          subtotal_amount: number | null;
          vat_rate: number | null;
          vat_amount: number | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
      };
      quote_items: {
        Row: {
          id: string;
          quote_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          created_at: string;
          updated_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          quote_id: string | null;
          customer_id: string | null;
          // Guest customer fields
          customer_name: string | null;
          customer_email: string | null;
          customer_phone: string | null;
          // Fulfillment
          fulfillment_type: 'DELIVERY' | 'PICKUP' | null;
          delivery_address: string | null;
          county: string | null;
          courier_service: string | null;
          delivery_notes: string | null;
          // Pricing
          pricing_model: 'RETAIL' | 'WHOLESALE';
          // Status
          status:
            | 'PENDING'
            | 'PROCESSING'
            | 'SHIPPED'
            | 'DELIVERED'
            | 'CANCELLED'
            | 'REFUNDED';
          payment_status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
          total_amount: number;
          subtotal_amount: number | null;
          vat_rate: number | null;
          vat_amount: number | null;
          // Invoice
          invoice_number: string | null;
          invoice_url: string | null;
          invoice_access_token_hash: string | null;
          whatsapp_sent: boolean;
          // Addresses (legacy)
          shipping_address: string | null;
          billing_address: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      stock_status: 'IN_STOCK' | 'OUT_OF_STOCK' | 'PRE_ORDER' | 'DISCONTINUED';
      quote_status:
        | 'DRAFT'
        | 'PENDING'
        | 'REVIEWING'
        | 'APPROVED'
        | 'REJECTED'
        | 'FULFILLED';
      order_status:
        | 'PENDING'
        | 'PROCESSING'
        | 'SHIPPED'
        | 'DELIVERED'
        | 'CANCELLED'
        | 'REFUNDED';
      payment_status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
      fulfillment_type: 'DELIVERY' | 'PICKUP';
      pricing_model: 'RETAIL' | 'WHOLESALE';
    };
  };
}
