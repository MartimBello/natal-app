// Database types for Supabase
// These match the database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          client_name: string
          client_number: string
          phone_number: string | null
          pickup_location: 'amoreira' | 'lisboa' | 'casa'
          pickup_date: string | null
          pickup_time: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_name: string
          client_number?: string
          phone_number?: string | null
          pickup_location: 'amoreira' | 'lisboa' | 'casa'
          pickup_date?: string | null
          pickup_time?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          client_number?: string
          phone_number?: string | null
          pickup_location?: 'amoreira' | 'lisboa' | 'casa'
          pickup_date?: string | null
          pickup_time?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_products: {
        Row: {
          id: string
          order_id: string
          product_name: string
          quantity: number
          item_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_name: string
          quantity: number
          item_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_name?: string
          quantity?: number
          item_price?: number
        }
      }
      products: {
        Row: {
          id: string
          name: string
          price: number
          unit_type: 'unit' | 'kg' | 'liters'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          unit_type?: 'unit' | 'kg'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          unit_type?: 'unit' | 'kg'
          created_at?: string
        }
      }
    }
  }
}

