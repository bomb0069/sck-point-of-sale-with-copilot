// User types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'cashier';
  is_active: boolean;
}

// Product types
export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category_id: number;
  category_name?: string;
  price: number;
  cost?: number;
  stock_quantity: number;
  min_stock_level: number;
  barcode?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Customer types
export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyalty_points: number;
  available_points?: number;
  available_baht_value?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Loyalty Points types
export interface LoyaltyPointTransaction {
  id: number;
  customer_id: number;
  transaction_type: 'earned' | 'redeemed' | 'expired';
  points: number;
  sale_id?: number;
  baht_amount?: number;
  expiry_date?: string;
  notes?: string;
  created_at: string;
}

export interface LoyaltyPointBalance {
  id: number;
  customer_id: number;
  points: number;
  earned_date: string;
  expiry_date: string;
  is_expired: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerLoyaltySummary {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  total_points: number;
  available_points: number;
  available_baht_value: number;
  total_transactions: number;
  total_spent: number;
  member_since: string;
}

export interface LoyaltyRedemption {
  customer_id: number;
  points_to_redeem: number;
  baht_amount: number;
}

// Store types
export interface Store {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Sale types
export interface Sale {
  id: number;
  receipt_number: string;
  store_id: number;
  user_id: number;
  customer_id?: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  loyalty_points_used?: number;
  loyalty_discount_amount?: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'digital_wallet' | 'mixed';
  payment_status: 'pending' | 'completed' | 'refunded';
  notes?: string;
  created_at: string;
  items: SaleItem[];
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  subtotal: number;
}

// For creating sale items (without id and sale_id)
export interface CreateSaleItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  subtotal: number;
}

// For creating sales
export interface CreateSale {
  customer_id?: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  loyalty_points_used?: number;
  loyalty_discount_amount?: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'digital_wallet' | 'mixed';
  payment_status: 'pending' | 'completed' | 'refunded';
  notes?: string;
  items: CreateSaleItem[];
}

// Cart types for POS interface
export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
}

// API Response types
export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Report types
export interface SalesReport {
  date: string;
  total_sales: number;
  total_transactions: number;
  avg_transaction_value: number;
  top_products: {
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }[];
}

// Inventory types
export interface InventoryMovement {
  id: number;
  product_id: number;
  movement_type: 'sale' | 'purchase' | 'adjustment' | 'return';
  quantity_change: number;
  reference_id?: number;
  notes?: string;
  created_at: string;
}
